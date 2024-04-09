/**
 * React Component
 * -----------------------------------------------
 * 
 * This File is responsible to display the load's 
 * pickups details with thier packages details
 * 
 * ------------------------------------------------
 * 
 *  - View details with he help of nestes MUI tab context
 *  - A Pick up can have multiple packages
 *  - Redux tool kit is used for API calling
 *  - Accepting pickups array as an props
 *    [{
 *       pickup_details:{}
 *       packages: [{drop_off_details:{}, ...others}]
 *    }] 
 */

// Import predefine libraries
import { useState } from "react";
import { FormattedMessage } from "react-intl";

// import MUI
import {
    Box,
    Tab,
    Stack,
    Grid,
    Typography
} from "@mui/material";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import TabContext from "@mui/lab/TabContext";

// Custom Hooks, resuseable components and common functions
import { DATE_FORMAT, TIME_FORMAT } from "utils/constants/regex";
import { CamelCase, FormattedAddress, utcToProfileTimeZone } from "utils/commonFunctions";

function LoadPickups({ pickups = [] }) {

    // Lacal States
    const [selectedTab, setSelectedTab] = useState("0");
    const [selectedPackageTab, setSelectedPackageTab] = useState("package-0");

    // Handle tab on change event and set the local state for pick up
    const handleOnTabChange = (_, newValue) => {
        setSelectedTab(newValue);
    }

    // Handle tab on change event and set the local state for package's under pickup
    const handleOnPackageTabChange = (_, newValue) => {
        setSelectedPackageTab(newValue);
    }

    return (
        <Box className="pick-up-section" sx={{ '& .MuiTabs-root .MuiTabs-scroller button': { mr: 2 }, mt: 3 }}>
            <TabContext value={selectedTab}>
                <Box sx={{ mt: 2, backgroundColor: '#f4f4f4', borderRadius: '5px 5px 0 0' }}>
                    <Stack direction="row" alignItems="center" className="customTabFilled">
                        <TabList
                            scrollButtons="false"
                            allowScrollButtonsMobile
                            visibleScrollbar="true"
                            onChange={handleOnTabChange}
                        >
                            {pickups.map((_, index) => (
                                <Tab
                                    title={`Pick up ${index + 1}`}
                                    label={
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span style={{ lineHeight: '24px' }}>{`Pick up ${index + 1}`}</span>
                                        </div>
                                    }
                                    value={`${index}`}
                                />
                            ))
                            }
                        </TabList>
                    </Stack>
                </Box>
                {pickups.map((pickup, index) => (
                    <TabPanel className="tabs-inner" value={`${index}`} sx={{ px: 0, pb: 0, mb: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Stack direction="row" alignItems="center" sx={{ flexGrow: "1" }}>
                                    <Box sx={{ minWidth: '55px', height: '55px', mr: 1.5, }} className="iconborderBox">
                                        <svg width="25" height="26" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12.5 14.4893C14.2949 14.4893 15.75 13.0342 15.75 11.2393C15.75 9.44433 14.2949 7.98926 12.5 7.98926C10.7051 7.98926 9.25 9.44433 9.25 11.2393C9.25 13.0342 10.7051 14.4893 12.5 14.4893Z" stroke="#E0001B" stroke-width="1.5" />
                                            <path d="M3.77082 9.34343C5.8229 0.322593 19.1875 0.33301 21.2291 9.35384C22.4271 14.6455 19.1354 19.1247 16.25 21.8955C14.1562 23.9163 10.8437 23.9163 8.73957 21.8955C5.86457 19.1247 2.5729 14.6351 3.77082 9.34343Z" stroke="#0E2028" stroke-width="1.5" />
                                        </svg>
                                    </Box>
                                    <CardData title="Pickup Location" value={CamelCase(FormattedAddress(pickup?.pickup_details?.address))} />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Stack direction="row" alignItems="center" sx={{ flexGrow: "1" }}>
                                    <Box sx={{ minWidth: '55px', height: '55px', mr: 1.5, }} className="iconborderBox">
                                        <svg width="25" height="26" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8.33325 2.58301V5.70801" stroke="#0E2028" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M16.6667 2.58301V5.70801" stroke="#0E2028" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M3.64575 9.96875H21.3541" stroke="#0E2028" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M21.875 9.35384V18.208C21.875 21.333 20.3125 23.4163 16.6667 23.4163H8.33333C4.6875 23.4163 3.125 21.333 3.125 18.208V9.35384C3.125 6.22884 4.6875 4.14551 8.33333 4.14551H16.6667C20.3125 4.14551 21.875 6.22884 21.875 9.35384Z" stroke="#0E2028" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M12.4953 14.7708H12.5047" stroke="#E0001B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M8.63987 14.7708H8.64922" stroke="#E0001B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M8.63987 17.8958H8.64922" stroke="#E0001B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </Box>
                                    <CardData title="Pickup Date" value={utcToProfileTimeZone(
                                        pickup?.pickup_details?.date,
                                        pickup?.pickup_details?.time,
                                        pickup?.pickup_details?.address?.timezone,
                                        DATE_FORMAT
                                    )} />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Stack direction="row" alignItems="center" sx={{ flexGrow: "1" }}>
                                    <Box sx={{ minWidth: '55px', height: '55px', mr: 1.5, }} className="iconborderBox">
                                        <svg width="25" height="26" viewBox="0 0 25 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22.9166 12.9997C22.9166 18.7497 18.2499 23.4163 12.4999 23.4163C6.74992 23.4163 2.08325 18.7497 2.08325 12.9997C2.08325 7.24967 6.74992 2.58301 12.4999 2.58301C18.2499 2.58301 22.9166 7.24967 22.9166 12.9997Z" stroke="#0E2028" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M16.3645 16.3128L13.1353 14.3857C12.5728 14.0524 12.1145 13.2503 12.1145 12.5941V8.32324" stroke="#E0001B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </Box>
                                    <CardData title={<FormattedMessage id="Pickup Time" />} value={utcToProfileTimeZone(
                                        pickup?.pickup_details?.date,
                                        pickup?.pickup_details?.time,
                                        pickup?.pickup_details?.address?.timezone,
                                        TIME_FORMAT
                                    )} />
                                </Stack>
                            </Grid>
                        </Grid>
                        <TabContext value={selectedPackageTab}>
                            <Box sx={{ borderBottom: 1, borderColor: "#f4f4f4", mt: 2, backgroundColor: '#f4f4f4', px: 2, pt: 0.4, borderRadius: '5px 5px 0 0' }}>
                                <Stack direction="row" className="customTabs tabs-sm" alignItems="center">
                                    <TabList
                                        allowScrollButtonsMobile
                                        onChange={handleOnPackageTabChange}
                                    >
                                        {pickups[index].packages.map((_, packageIndex) => {
                                            return <Tab
                                                title={`Package  ${packageIndex + 1}`}
                                                label={
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <span style={{ marginRight: '8px', lineHeight: '24px' }}>{`Package ${packageIndex + 1}`}</span>
                                                    </div>
                                                }
                                                value={`package-${packageIndex}`}
                                            />
                                        }
                                        )
                                        }
                                    </TabList>
                                </Stack>
                            </Box>
                            {pickups[index].packages.map((packageData, packageIndex) => (
                                <TabPanel value={`package-${packageIndex}`} sx={{ p: 2, border: '1px solid #f4f4f4', backgroundColor: '#fff' }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <CardData title={<FormattedMessage id="drop-off-location" />} value={CamelCase(FormattedAddress(packageData?.drop_of_details?.address))} />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <CardData title={<FormattedMessage id="drop-off-date" />} value={utcToProfileTimeZone(
                                                packageData?.drop_of_details?.date,
                                                packageData?.drop_of_details?.time,
                                                packageData?.drop_of_details?.timezone,
                                                DATE_FORMAT
                                            )} />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <CardData title={<FormattedMessage id="drop-off-time" />} value={utcToProfileTimeZone(
                                                packageData?.drop_of_details?.date,
                                                packageData?.drop_of_details?.time,
                                                packageData?.drop_of_details?.timezone,
                                                TIME_FORMAT
                                            )} />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <CardData title={<FormattedMessage id="Commodity" />} value={packageData?.commodity?.name || '-NA-'} />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <CardData title={<FormattedMessage id="commodity-weight" />} value={packageData?.package_weight || '-NA-'} />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <CardData title={<FormattedMessage id="commodity-cube-size" />} value={packageData?.commodity_cube_size || '-NA-'} />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <CardData title={<FormattedMessage id="temperature" />} value={packageData?.temperature || '-NA-'} />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <CardData title={<FormattedMessage id="po_number" />} value={packageData?.po_number || '-NA-'} />
                                        </Grid>
                                        <Grid item xs={12} sm={12}>
                                            <CardData title={<FormattedMessage id="note" />} value={CamelCase(packageData?.note) || '-NA-'} />
                                        </Grid>
                                    </Grid>
                                </TabPanel>))
                            }
                        </TabContext>
                    </TabPanel>)
                )}
            </TabContext>
        </Box>
    );
}


/**
 * Reuseable Functional Component
 * CardData Function Accept Title and Value 
 * -----------------------------------------
 *  - Return HTML 
 *  - Render HTML like a Box have title on top and value on bottom
 */
const CardData = ({ title, value }) => {
    return (
        <Stack
            sx={{ flexDirection: { xs: "column", sm: "column" } }}
        >
            <Typography
                component="div"
                variant="body1"
                className="fixedTitle"
                sx={{ fontSize: "14px", lineHeight: "1.3" }}
            >
                {title}
            </Typography>
            <Typography
                variant="subtitle1"
                component="span"
                sx={{ color: "grey.700", fontSize: "14px", lineHeight: "1.3", mt: 0.5 }}
            >
                {value}
            </Typography>
        </Stack>
    )
}
export default LoadPickups;