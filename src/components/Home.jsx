import React from 'react';
import { getAuth } from 'firebase/auth';
import MasterBoxTable from './tables/MasterBoxTable';
import BoxTable from './tables/BoxTable';
import MemberTable from './tables/MemberTable';

// import reactLogo from './../assets/react.svg'
// import viteLogo from './../assets/vite.svg' //'./../../vite.svg'
import { useSelector } from 'react-redux';
// import {
//   MaterialReactTable,
//   useMaterialReactTable,
// } from 'material-react-table';
import { Box } from '@mui/material';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
// import LoginSignupModal from './modals/LoginSignupModal'

function Home() {
    const [selectedTabValue, setSelectedTabValue] = React.useState('1');
    const auth = getAuth();
    const curUserRole = useSelector(state => state.curUserRole);

    const handleChange = (event, newValue) => {
      setSelectedTabValue(newValue);
    };
    const shouldDisableButtonSet = !auth.currentUser || curUserRole !== 'admin'
    
    return (<>
        <div className="div-for-home-tab-content" >
          <TabContext value={selectedTabValue}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleChange} aria-label="lab API tabs example">
                <Tab label="Boxes Table" value="1"/>
                <Tab label="Master Items Table" value="2" disabled/>
                <Tab label="Members Table" value="3" disabled/>
              </TabList>
            </Box>
            <TabPanel value="1"><BoxTable/></TabPanel>
            <TabPanel value="2"><MasterBoxTable/></TabPanel>
            <TabPanel value="3"><MemberTable/></TabPanel>
          </TabContext>
        </div>
    </>);
}

export default Home;