import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import md5 from 'crypto-js/md5';
import { setQueryString, setQId } from '../../store/istexApiSlice';
import {
  buildQueryStringFromArks,
  isArkQueryString,
  getArksFromArkQueryString,
  buildQueryStringFromCorpusFile,
  getQueryStringFromQId,
} from '../../lib/istexApi';
import eventEmitter, { events } from '../../lib/eventEmitter';
import { queryModes, istexApiConfig } from '../../config';
import { RadioGroup } from '@headlessui/react';
import { CloudUploadIcon, InformationCircleIcon } from '@heroicons/react/solid';

export default function QueryInput () {
  const dispatch = useDispatch();
  const [currentQueryMode, setCurrentQueryMode] = useState(queryModes.getDefault().value);
  const [queryStringInputValue, setQueryStringInputValue] = useState('');
  const [arkInputValue, setArkInputValue] = useState('');

  const queryStringHandler = newQueryString => {
    if (!newQueryString) {
      setArkInputValue('');
    }

    if (isArkQueryString(newQueryString)) {
      const arkList = getArksFromArkQueryString(newQueryString).join('\n');
      setArkInputValue(arkList);
      setCurrentQueryMode(queryModes.modes.find(queryMode => queryMode.value === 'ark').value);
    } else {
      setCurrentQueryMode(queryModes.getDefault().value);
      setQueryStringInputValue(newQueryString);
    }

    updateQueryString(newQueryString);
  };

  const updateQueryString = newQueryString => {
    dispatch(setQueryString(newQueryString));

    eventEmitter.emit(events.setQueryStringUrlParam, newQueryString);
    eventEmitter.emit(events.setQueryStringInLastRequestOfHistory, newQueryString);

    if (!newQueryString) {
      eventEmitter.emit(events.resetResultPreview);
      return;
    }

    // If the query string is too long to be set in a URL search parameter, we replace it with a q_id instead
    if (newQueryString.length > istexApiConfig.queryStringMaxLength) {
      // Yes, the hashing has to be done on the client side, this is due to a questionable design of the /q_id
      // route of the API and might (hopefully) change in the future
      const hashedValue = md5(newQueryString).toString();
      qIdHandler(hashedValue, newQueryString);
    }
  };

  const qIdHandler = async (newQId, originalQueryString) => {
    dispatch(setQId(newQId));

    eventEmitter.emit(events.setQIdUrlParam, newQId);

    // newQId can be an empty string when the qId is reset, if that's the case, we don't want to send a request
    // to get the corresponding queryString so we just stop here
    if (!newQId) return;

    // If originalQueryString was not passed we need to fetch it from the API using the qId
    if (!originalQueryString) {
      try {
        const response = await getQueryStringFromQId(newQId);
        originalQueryString = response.data.req;
        dispatch(setQueryString(originalQueryString));
      } catch (err) {
        // TODO: print the error in a modal or something else
        console.error(err);
      }
    }
  };

  const queryModeHandler = newQueryMode => {
    setCurrentQueryMode(newQueryMode);
  };

  const queryInputHandler = newQueryStringInput => {
    eventEmitter.emit(events.setNumberOfDocuments, 0);

    setQueryStringInputValue(newQueryStringInput);
    updateQueryString(newQueryStringInput);
  };

  const arkListHandler = arkList => {
    eventEmitter.emit(events.setNumberOfDocuments, 0);

    setArkInputValue(arkList);

    // If the ark list is empty, just pass it to updateQueryString and let this function handle the case
    if (!arkList) {
      updateQueryString(arkList);
      return;
    }

    const arks = arkList.split('\n');
    const queryString = buildQueryStringFromArks(arks);
    updateQueryString(queryString);
  };

  const corpusFileHandler = file => {
    eventEmitter.emit(events.setNumberOfDocuments, 0);

    if (!file) return;

    const reader = new window.FileReader();
    reader.readAsText(file, 'utf-8');
    reader.onload = event => {
      const queryString = buildQueryStringFromCorpusFile(event.target.result);
      updateQueryString(queryString);
    };

    // TODO: print the error in a modal or something else
    reader.onerror = console.error;
  };

  useEffect(() => {
    eventEmitter.addListener(events.setQueryMode, queryModeHandler);
    eventEmitter.addListener(events.setQueryString, queryStringHandler);
    eventEmitter.addListener(events.setQId, qIdHandler);
  }, []);

  let queryInputUi;
  switch (currentQueryMode) {
    case queryModes.modes[0].value:
      queryInputUi = (
        <textarea
          rows='1'
          className='w-full border-[1px] border-istcolor-green-dark p-2'
          name='queryInput'
          placeholder='brain AND language:fre'
          value={queryStringInputValue}
          onChange={event => queryInputHandler(event.target.value)}
        />
      );
      break;
    case queryModes.modes[1].value:
      queryInputUi = (
        <textarea
          className='w-full border-[1px] border-istcolor-green-dark p-2'
          rows='2'
          cols='30'
          name='queryInput'
          placeholder='ark:/67375/0T8-JMF4G14B-2&#x0a;ark:/67375/0T8-RNCBH0VZ-8'
          value={arkInputValue}
          onChange={event => arkListHandler(event.target.value)}
        />
      );
      break;
    case queryModes.modes[2].value:
      // The value attribute is harcoded to '' so that React stop crying about this input being uncontrolled.
      // Meanwhile the docs say that file input can't be controlled for security reasons... (https://reactjs.org/docs/uncontrolled-components.html#the-file-input-tag)
      queryInputUi = (
        <>
          <div className='flex justify-center items-center w-full mb-5'>
            <label
              forHtml='dropzone-file'
              className='flex flex-col justify-center items-center rounded-lg border-2 text-[#458ca5] border-[#458ca5] border-dashed cursor-pointer hover:border-istcolor-green-light hover:text-black'
            >
              <div className='flex flex-col justify-center items-center pt-5 pb-6'>
                <CloudUploadIcon className='w-12 h-12 my-4' />
                <p className='mx-2 mb-2 text-sm'>Sélectionnez votre fichier</p>
              </div>
              <input
                id='dropzone-file'
                type='file'
                className='hidden'
                name='queryInput'
                accept='.corpus'
                value=''
                onChange={event => corpusFileHandler(event.target.files[0])}
              />
            </label>
          </div>
        </>
      );
      break;
    case queryModes.modes[3].value:
      queryInputUi = (
        <textarea
          className='w-full border-[1px] border-istcolor-green-dark p-2'
          rows='2'
          cols='30'
          name='queryInput'
          placeholder="Cliquez pour bénéficier de l'aide en ligne"
          value=''
          onChange={event => arkListHandler(event.target.value)}
        />
      );
      break;
  }

  return (
    <div className='cursor-pointer'>
      <div className='w-full border-b-[2px] border-b-istcolor-green-dark flex items-end'>
        <RadioGroup
          className='flex'
          value={currentQueryMode}
          onChange={setCurrentQueryMode}
          name='queryMode'
        >
          {queryModes.modes.map(({ label, value }) => (
            <div key={label}>
              <RadioGroup.Option
                className='flex items-center font-medium mr-2'
                value={value}
              >
                {({ checked }) => (
                  <>
                    <span className={`flex items-center justify-center px-[30px] py-2 text-center w-full border-[1px] font-bold ${checked ? 'bg-istcolor-green-dark hover:bg-istcolor-green-light text-white' : 'bg-istcolor-grey-extra-light text-istcolor-grey-dark'}`}>
                      {label}
                      <InformationCircleIcon className='h-7 w-7 pl-2' />
                    </span>
                  </>
                )}
              </RadioGroup.Option>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className='my-2'>
        {queryInputUi}
      </div>
    </div>
  );
}
