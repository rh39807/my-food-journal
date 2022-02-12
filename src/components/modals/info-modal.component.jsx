import React from 'react';
import { Backdrop, Box, Modal, Fade, Typography, Divider } from '@mui/material';

const style = {
  position: 'absolute',
  top: '40%',
  left: '50%',
  outline: 0,
  transform: 'translate(-50%, -50%)',
  width: 'max-content',
  bgcolor: 'background.paper',
  border: '1px solid grey',
  borderRadius: '10px',
  boxShadow: 24,
  p: 4,
};

export default function ModalInfo(props) {

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={props.open}
        onClose={props.handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={props.open}>
          <Box sx={style}>
            <Typography id="transition-modal-title" variant="h6" component="h2">
              {props.title}
            </Typography>
            <Divider sx={{margin:'10px'}}/>
            {props.body}
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}