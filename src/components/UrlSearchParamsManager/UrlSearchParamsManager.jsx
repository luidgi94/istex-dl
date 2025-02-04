import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseExtractParams } from '../../lib/istexApi';
import { isValidMd5 } from '../../lib/utils';
import eventEmitter, { events } from '../../lib/eventEmitter';
import { istexApiConfig, usages } from '../../config';

export default function UrlSearchParamsManager () {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryString = searchParams.get('q');
  const qId = searchParams.get('q_id');
  const extractParamsAsString = searchParams.get('extract');
  const numberOfDocumentsAsString = searchParams.get('size');
  const rankingMode = searchParams.get('rankBy');
  const compressionLevelAsString = searchParams.get('compressionLevel');
  const archiveType = searchParams.get('archiveType');
  const usage = searchParams.get('usage');

  const fillFormFromUrlSearchParams = () => {
    // For each URL search parameter, we check if it's defined (it might still be an empty string).
    // We need to make sure it's defined to avoid force setting an URL parameter when it was not defined
    // in the first place. We just want to correct them when they're defined but have an invalid value.

    if (queryString && qId) {
      // The 'q' and 'q_id' URL search parameters cannot be set at the same time so, if it's the case,
      // we removed them from the URL and an error message is displayed in UI
      searchParams.delete('q');
      searchParams.delete('q_id');

      // TODO: display an error modal or something else that says that 'q' and 'q_id' cannot be set at
      // the same time
    } else if (queryString) {
      eventEmitter.emit(events.setQueryString, queryString);
    } else if (isValidMd5(qId)) {
      eventEmitter.emit(events.setQId, qId);
    }

    if (extractParamsAsString != null) {
      const selectedFormats = parseExtractParams(decodeURIComponent(extractParamsAsString));
      eventEmitter.emit(events.setSelectedFormats, selectedFormats);
    }

    if (numberOfDocumentsAsString != null) {
      let numberOfDocuments = parseInt(numberOfDocumentsAsString);

      if (isNaN(numberOfDocuments) || numberOfDocuments < 0) {
        numberOfDocuments = 0;
      }

      eventEmitter.emit(events.setNumberOfDocuments, numberOfDocuments);
    }

    if (rankingMode != null) {
      let rankingModeToUse = rankingMode;

      if (!istexApiConfig.rankingModes.modes.find(mode => mode.value === rankingModeToUse)) {
        rankingModeToUse = istexApiConfig.rankingModes.getDefault().value;
      }

      eventEmitter.emit(events.setRankingMode, rankingModeToUse);
    }

    if (compressionLevelAsString != null) {
      let compressionLevel = parseInt(compressionLevelAsString);

      if (isNaN(compressionLevel) || !istexApiConfig.compressionLevels.levels.find(({ value }) => compressionLevel === value)) {
        compressionLevel = istexApiConfig.compressionLevels.getDefault().value;
      }

      eventEmitter.emit(events.setCompressionLevel, compressionLevel);
    }

    if (archiveType != null) {
      let archiveTypeToUse = archiveType;

      if (!istexApiConfig.archiveTypes.types.find(type => type.value === archiveType)) {
        archiveTypeToUse = istexApiConfig.archiveTypes.getDefault().value;
      }

      eventEmitter.emit(events.setArchiveType, archiveTypeToUse);
    }

    if (usage != null) {
      if (Object.keys(usages).includes(usage)) {
        eventEmitter.emit(events.setUsage, usage);
      } else {
        searchParams.delete('usage');
      }
    }

    setSearchParams(searchParams);
  };

  const setUrlSearchParam = (name, value) => {
    // We only want to delete the URL search parameter when the value is falsy but not 0 because 0 is a valid
    // value for some parameters
    if (!value && value !== 0) {
      searchParams.delete(name);
    } else {
      searchParams.set(name, value);
    }

    setSearchParams(searchParams);
  };

  const setQueryStringUrlParam = queryStringParam => {
    if (searchParams.has('q_id')) searchParams.delete('q_id');

    setUrlSearchParam('q', queryStringParam);
  };

  const setQIdUrlParam = qIdParam => {
    if (searchParams.has('q')) searchParams.delete('q');

    setUrlSearchParam('q_id', qIdParam);
  };

  const resetUrlParams = () => {
    setSearchParams({});
  };

  useEffect(() => {
    fillFormFromUrlSearchParams();

    eventEmitter.addListener(events.setQueryStringUrlParam, setQueryStringUrlParam);
    eventEmitter.addListener(events.setQIdUrlParam, setQIdUrlParam);
    eventEmitter.addListener(events.setNumberOfDocumentsUrlParam, newSize => setUrlSearchParam('size', newSize));
    eventEmitter.addListener(events.setRankingModeUrlParam, newRankingMode => setUrlSearchParam('rankBy', newRankingMode));
    eventEmitter.addListener(events.setExtractUrlParam, newExtractParam => setUrlSearchParam('extract', newExtractParam));
    eventEmitter.addListener(events.setCompressionLevelUrlParam, newCompressionLevel => setUrlSearchParam('compressionLevel', newCompressionLevel));
    eventEmitter.addListener(events.setArchiveTypeUrlParam, newArchiveType => setUrlSearchParam('archiveType', newArchiveType));
    eventEmitter.addListener(events.setUsageUrlParam, newUsage => setUrlSearchParam('usage', newUsage));
    eventEmitter.addListener(events.resetUrlParams, resetUrlParams);
  }, []);

  return null;
}
