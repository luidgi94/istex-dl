import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './HistoryRequest.css';
import {
  buildExtractParamsFromFormats,
  buildFullApiUrl,
  sendDownloadApiRequest,
  getQueryStringFromQId,
  isArkQueryString,
  getArksFromArkQueryString,
} from '../../lib/istexApi';
import eventEmitter, { events } from '../../lib/eventEmitter';
import historyManager from '../../lib/HistoryManager';
import { buildFullIstexDlUrl } from '../../lib/utils';

export default function HistoryRequest ({ requestInfo }) {
  const [requestStringToDisplay, setRequestStringToDisplay] = useState('');

  const editHandler = () => {
    if (requestInfo.qId) {
      eventEmitter.emit(events.setQId, requestInfo.qId);
    } else {
      eventEmitter.emit(events.setQueryString, requestInfo.queryString);
    }

    eventEmitter.emit(events.setSelectedFormats, requestInfo.selectedFormats);
    eventEmitter.emit(events.setNumberOfDocuments, requestInfo.numberOfDocuments);
    eventEmitter.emit(events.setRankingMode, requestInfo.rankingMode);
    eventEmitter.emit(events.setCompressionLevel, requestInfo.compressionLevel);
    eventEmitter.emit(events.setArchiveType, requestInfo.archiveType);
    eventEmitter.emit(events.setUsage, requestInfo.usage);

    eventEmitter.emit(events.closeHistoryModal);
  };

  const downloadHandler = () => {
    const url = buildFullApiUrl(requestInfo).toString();

    // This function is synchronous
    sendDownloadApiRequest(url);

    historyManager.add({
      ...requestInfo,
      date: Date.now(),
    });
  };

  const shareHandler = () => {
    const istexDlFullUrl = buildFullIstexDlUrl(requestInfo);

    navigator.clipboard.writeText(istexDlFullUrl.href)
      .then(() => window.alert(`${istexDlFullUrl.href} copied to clipboard!`))
      .catch(() => window.alert(`${istexDlFullUrl.href} failed to copy to clipboard!`));
  };

  const deleteHandler = () => {
    historyManager.remove(requestInfo.index);
  };

  const getRequestStringToDisplay = async () => {
    let requestStringToDisplay;

    if (requestInfo.qId) {
      try {
        const response = await getQueryStringFromQId(requestInfo.qId);

        requestStringToDisplay = response.data.req;
      } catch (err) {
        // TODO: print an error message in a modal or delete the request from the history maybe
        console.error(err);

        requestStringToDisplay = requestInfo.qId;
      }
    }

    if (requestInfo.queryString) {
      requestStringToDisplay = requestInfo.queryString;
    }

    if (isArkQueryString(requestStringToDisplay)) {
      requestStringToDisplay = getArksFromArkQueryString(requestStringToDisplay).join('\n');
    }

    return requestStringToDisplay;
  };

  useEffect(async () => {
    setRequestStringToDisplay(await getRequestStringToDisplay());
  }, []);

  return (
    <div className='history-request'>
      <div className='history-request-item index'>{requestInfo.index + 1}</div>
      <div className='history-request-item date'>{requestInfo.date}</div>
      <div className='history-request-item request'>{requestStringToDisplay}</div>
      <div className='history-request-item formats'>{buildExtractParamsFromFormats(requestInfo.selectedFormats)}</div>
      <div className='history-request-item nb-docs'>{requestInfo.numberOfDocuments}</div>
      <div className='history-request-item rank'>{requestInfo.rankingMode}</div>
      <div className='history-request-item actions'>
        <button onClick={editHandler}>Edit</button>
        <button onClick={downloadHandler}>Download</button>
        <button onClick={shareHandler}>Share</button>
        <button onClick={deleteHandler}>Delete</button>
      </div>
    </div>
  );
}

HistoryRequest.propTypes = {
  requestInfo: PropTypes.object,
};
