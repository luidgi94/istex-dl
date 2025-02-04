import React, { useState } from 'react';
import { Modal } from 'flowbite-react';
import PropTypes from 'prop-types';

export default function ModalShareButton ({ initOpening = false, urlToClipboard = '', setOpenModal, handleSaveToClipboard }) {
  const [open, setOpen] = useState(initOpening);

  const onClose = () => {
    setOpen(false);
    setOpenModal(false);
  };

  return (
    <>
      <Modal
        show={open}
        onClose={onClose}
      >
        <Modal.Header>
          Partager
        </Modal.Header>
        <Modal.Body>
          <div className='space-y-6'>
            <div
              className='relative w-full'
            >
              <input
                type='text'
                className='block p-2.5 w-full z-20 text-sm text-black bg-istcolor-grey-extra-light border-l-gray-100 border-l-2 border border-gray-300 focus:ring-blue-500 focus:border-istcolor-grey-medium'
                placeholder={urlToClipboard}
                readOnly
              />
              <button
                type='button'
                className='absolute top-0 right-0 p-2.5 text-sm font-medium text-white bg-istcolor-blue border border-istcolor-blue cta1 focus:ring-4 focus:outline-none'
                onClick={handleSaveToClipboard}
              >
                Copier
              </button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className='flex w-full justify-end'>
            <button
              type='button'
              onClick={onClose}
              className='p-2 text-white bg-istcolor-blue border border-istcolor-blue cta1 focus:ring-4 focus:outline-none'
            >
              Annuler
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

ModalShareButton.propTypes = {
  initOpening: PropTypes.bool,
  urlToClipboard: PropTypes.string,
  setOpenModal: PropTypes.func,
  handleSaveToClipboard: PropTypes.func,
};
