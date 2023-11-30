import React, { useState, useEffect, useRef, useMemo } from 'react';
import MasterBoxTable from './tables/MasterBoxTable';
import BoxTable from './tables/BoxTable';
import MemberTable from './tables/MemberTable';


import reactLogo from './../assets/react.svg'
import viteLogo from './../assets/vite.svg' //'./../../vite.svg'
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   MaterialReactTable,
//   useMaterialReactTable,
// } from 'material-react-table';
import { Box } from '@mui/material';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import LoginSignupModal from './modals/LoginSignupModal'

function Home() {
    const [selectedTabValue, setSelectedTabValue] = React.useState('1');
    const handleChange = (event, newValue) => {
      setSelectedTabValue(newValue);
    };
    return (<>
        <div className="div-for-home-tab-content" >
          <div style={{ position: 'absolute', top: 5, right: '8px', zIndex: 2000, widt: '250px' }}>
            <LoginSignupModal/>
          </div>
          <TabContext value={selectedTabValue}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleChange} aria-label="lab API tabs example">
                <Tab label="Items Master Table" value="1" />
                <Tab label="Boxes Table" value="2" />
                <Tab label="Members Table" value="3" />
              </TabList>
            </Box>
            <TabPanel value="1"><MasterBoxTable/></TabPanel>
            <TabPanel value="2"><BoxTable/></TabPanel>
            <TabPanel value="3"><MemberTable/></TabPanel>
          </TabContext>
        </div>
    </>);
}

export default Home;