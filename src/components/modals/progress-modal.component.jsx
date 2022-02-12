import React from 'react';
import { Box, CircularProgress, Modal, Backdrop, Fade } from '@mui/material';


const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'max-content',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 2,
  };

const ProgressModal = ({ open, message })=> (
    <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
        timeout: 500,
        }}
    >
        <Fade in={open}>
            <Box sx={modalStyle}>
                <div> {message}
                    <CircularProgress
                                size={18}
                                sx={{color: '#a4b0be',marginLeft: '4px'}}
                            />
                </div>
            </Box>
        </Fade>
    </Modal>
)

export default ProgressModal;