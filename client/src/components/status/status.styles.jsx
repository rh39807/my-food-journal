import styled from 'styled-components';
import { Paper } from '@mui/material';

export const StatusContainer = styled(Paper)`
    display: flex;
    padding: 20px;
    height: max-content;
    width: 370px;
`

export const ChartContainer = styled('div')`
    position: relative;
    display: flex;
    justify-content: space-between;
    width: 380px;
    padding: 0px;
    margin: -20px 0px -56px 0px;
`

export const ChartTitle = styled('h4')`
    padding: 0px;
    margin: 4px 4px 0px 4px;
    font-size: 14px;
`

export const GridTitle = styled('h4')`
    padding: 0px;
    margin: -7px 2px 3px 2px;
`

export const ChartNoteLeft = styled('div')`
    position: absolute;
    top: 20px;
    left:  134px;
    z-index: 1;
    cursor: pointer;
`

export const ChartNoteRight= styled('div')`
    position: absolute;
    top: 20px;
    right: -10px;
    z-index: 3;
    cursor: pointer;
`