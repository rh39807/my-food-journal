import React from 'react';
import Status from '../../components/status/status.component';
import JournalDataGrid from '../../components/journal-data-grid/journal-data-grid.component';
import JournalEntryForm from '../../components/journal-entry-form/journal-entry-form.component';
import { Dashboard, MoreVert } from '@mui/icons-material';
import { Grid, Menu, MenuItem, Fade } from '@mui/material';
import { PageLayoutMenu, PageLayoutContainer } from './home-page.styles';

export function HomePage() {

    const [ layout, setLayout ] = React.useState(localStorage?.savedLayout ? Number(localStorage.savedLayout) : 0);
    const [ anchorEl, setAnchorEl] = React.useState(null);

    const layouts = [
        [2,1,0],
        [1,2,0],
        [0,1,2],
        [2,0,1]
    ]

    const items = [
        <Grid key='status' item>
            <Status/>
        </Grid>, 
        <Grid key='journaldatagrid' item>
            <JournalDataGrid/>
        </Grid>,
        <Grid key='journalentry' item >
            <JournalEntryForm/>
        </Grid>
    ]

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = (event) => {
        setAnchorEl(null);
    }

    const handleSelect = (event) => {
        const index = event.target.id;
        setLayout(Number(index));
        setAnchorEl(null);
        localStorage.savedLayout = index;
    }

    const open = Boolean(anchorEl);
    return (
        <React.Fragment>
            <PageLayoutContainer>
                <PageLayoutMenu>
                    <MoreVert onClick={handleClick} color='action'/>
                    <Menu
                        id="fade-menu"
                        MenuListProps={{ 'aria-labelledby': 'fade-button' }}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        TransitionComponent={Fade}
                    >
                        <MenuItem disabled divider disableGutters><Dashboard/> Page Layouts</MenuItem>
                        <MenuItem id='0' onClick={handleSelect} selected={layout === 0}>Input is my Game</MenuItem>
                        <MenuItem id='1' onClick={handleSelect} selected={layout === 1}>History is King</MenuItem>
                        <MenuItem id='2' onClick={handleSelect} selected={layout === 2}>Love My Stats</MenuItem>
                        <MenuItem id='3' onClick={handleSelect} selected={layout === 3}>Bottom Line It</MenuItem>
                        
                    </Menu>
                </PageLayoutMenu>
            </PageLayoutContainer>
            <Grid sx={{ padding: '10px' }} container>
                <Grid item xs={12} >
                    <Grid container justifyContent="space-around" spacing={2}>
                        {items[layouts[layout][0]]}
                        {items[layouts[layout][1]]}
                        {items[layouts[layout][2]]}
                    </Grid>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}



export default HomePage