/**
 * React Component
 * -----------------------------------------------
 * 
 * This File is responsible to manage the user's 
 * 
 * ------------------------------------------------
 * 
 *  - MUI use for ui and formik library is used to handle form and client side validtion
 *  - User will be addded as per role and other details
 *  - open, onClose, id, role_id accepted as props
 *  - open and onClose is used for dialog visibility
 *  - id is user id in case of edit
 *  - role_id is used when we are coming from role section and it will auto select the role 
 * 
 */

//Predefine library
import * as Yup from "yup";
import { Formik } from "formik";
import moment from "moment-timezone";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import { AsYouType } from "libphonenumber-js";
import { useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { isValidPhoneNumber } from "react-phone-number-input";

// MUI
import {
  Grid,
  Stack,
  InputLabel,
  Divider,
  Box,
  Button,
  FormHelperText,
  OutlinedInput,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Autocomplete,
  TextField,
  Dialog,
  DialogContent,
} from "@mui/material";
import "react-phone-input-2/lib/style.css";

//API Calls
import {
  useGetUserQuery,
  useUpdateUserMutation,
  useCreateMutation,
} from "apis/apiServices/userService";

// Reuseable components, common functions and other
import Loader from "components/Loader";
import ShouldRender from "hooks/shouldRender";
import ActionLoader from "components/ActionLoader";
import CustomDialogTitle from "./customDialogTitle";
import { NAME_FORMAT } from "utils/constants/regex";
import { openSnackbar } from "store/reducers/snackbar";
import { GetLocalStorageItem } from "utils/commonFunctions";
import AnimateButton from "components/@extended/AnimateButton";
import { useRolesQuery } from "apis/apiServices/roleService";
import { FIELD_MAX_LENGTH } from "utils/constants/validation-messages";

const ITEM_PADDING_TOP = 8;
const ITEM_HEIGHT = 48;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function ManageUserDialog({ open, onClose, id, role_id }) {

  // Handle locale
  const intl = useIntl();

  // Navigation
  const navigate = useNavigate();

  // to handle the redux action
  const dispatch = useDispatch();

  // local state
  const [countryChange, setCountryChange] = useState(false);

  //API Call

  const { data: userRoles = {}, isLoading } = useRolesQuery({
    department: null,
  });

  const [createCompanyEmployee, { isLoading: createLoading }] =
    useCreateMutation();

  const { data: editUserData = {}, isLoading: editUserDataLoading } =
    useGetUserQuery(id, { skip: !id });
    
  const [updateUser, { isLoading: updateLoading }] = useUpdateUserMutation();

  const userData = GetLocalStorageItem("auth");

  // Validation Schema
  const RegisterSchema = Yup.object().shape({
    first_name: Yup.string()
      .required(<FormattedMessage id="first-name-required" />)
      .max(
        FIELD_MAX_LENGTH.FIRST_NAME,
        <FormattedMessage
          id="character-max"
          values={{
            field: <FormattedMessage id="First Name" />,
            max: FIELD_MAX_LENGTH.FIRST_NAME,
          }}
        />
      )
      .matches(NAME_FORMAT, () => <FormattedMessage id="first-name-invalid" />),

    last_name: Yup.string()
      .max(
        FIELD_MAX_LENGTH.LAST_NAME,
        <FormattedMessage
          id="character-max"
          values={{
            field: <FormattedMessage id="Last Name" />,
            max: FIELD_MAX_LENGTH.LAST_NAME,
          }}
        />
      )
      .matches(NAME_FORMAT, () => <FormattedMessage id="last-name-invalid" />),

    email: Yup.string()
      .email(<FormattedMessage id="email-invalid" />)
      .max(
        FIELD_MAX_LENGTH.EMAIL,
        <FormattedMessage
          id="character-max"
          values={{
            field: <FormattedMessage id="Email" />,
            max: FIELD_MAX_LENGTH.EMAIL,
          }}
        />
      )
      .required(<FormattedMessage id="email-required" />),

    mobile: Yup.string().required(<FormattedMessage id="phone-required" />),

    roles: Yup.array().min(1, <FormattedMessage id="roles-required" />),
    profile_timezone: Yup.string().required(
      <FormattedMessage
        id="select-required"
        values={{ field: <FormattedMessage id="profile timezone" /> }}
      />
    ),
  });

  useEffect(() => {
    if (userData?.data?.mobile) {
      let value = new AsYouType().input(userData?.data?.mobile);
      let getCountryCode = value.trim().split(/\s+/);
      setCountryChange(getCountryCode[0]);
    }
  }, [userData]);

  if (isLoading || editUserDataLoading) {
    return <Loader />;
  }
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      scroll="paper"
    >

      <CustomDialogTitle
        title={
          id ? (
            <FormattedMessage id="update user" />
          ) : (
            <FormattedMessage id="create user" />
          )
        }
        onClose={onClose}
      ></CustomDialogTitle>
      <DialogContent sx={{ mt: 1 }} id="alert-dialog-description">
        <ShouldRender condition={createLoading || updateLoading}>
          <ActionLoader />
        </ShouldRender>
        <Formik
          initialValues={{
            first_name: editUserData?.data?.first_name || "",
            last_name: editUserData?.data?.last_name || "",
            email: editUserData?.data?.email || "",
            mobile: editUserData?.data?.mobile || "",
            roles:
              editUserData?.data?.roles?.map((role) => role.id) ||
              (role_id ? [role_id] : []),
            profile_timezone:
              editUserData?.data?.profile_timezone ||
              userData?.profile_timezone ||
              "",
          }}
          validationSchema={RegisterSchema}
          onSubmit={async (
            values,
            { setErrors, setFieldError, setStatus, setSubmitting }
          ) => {
            setSubmitting(true);
            if (values.mobile.includes("+") === false) {
              values.mobile = "+" + values.mobile;
            }

            let mobileValidate = isValidPhoneNumber(values.mobile);

            if (mobileValidate) {
              let response = "";
              if (id) {
                response = await updateUser({ id, data: values });
              } else {
                response = await createCompanyEmployee(values);
              }

              if (response.error) {
                setSubmitting(false);
                if (typeof response.error === "object") {
                  Object.keys(response.error).forEach((field) => {
                    setFieldError(field, response.error[field]);
                  });
                } else {
                  dispatch(
                    openSnackbar({
                      open: true,
                      message: response.error,
                      alert: { color: "error" },
                    })
                  );
                }
              } else {
                setStatus({ success: true });
                setSubmitting(false);
                dispatch(
                  openSnackbar({
                    open: true,
                    message: response?.data?.message,
                    alert: { color: "success" },
                  })
                );
                onClose();
              }
            } else {
              setSubmitting(false);
              setErrors({
                mobile: <FormattedMessage id="phone-invalid" />,
              });
            }
          }}
        >
          {({
            errors,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            touched,
            values,
            setFieldValue,
            dirty,
          }) => {
            return (
              <form noValidate onSubmit={handleSubmit}>
                <Grid container spacing={{ xs: 1.5, md: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.4}>
                      <InputLabel htmlFor="roles">
                        <Typography variant="span" sx={{ color: "error.main", fontWeight: 600 }}>
                          *{" "}
                        </Typography>
                        <FormattedMessage id="Role" />
                      </InputLabel>
                      <FormControl>
                        <Select
                          sx={{
                            color: "#777",
                            width: "100%",
                            "& .MuiSelect-outlined": {
                              paddingTop: "8.7px",
                              paddingBottom: "9px",
                            },
                          }}
                          labelId="roles-label"
                          id="roles"
                          multiple
                          name="roles"
                          displayEmpty
                          value={values.roles}
                          onOpen={handleBlur}
                          onChange={(e) => handleChange(e)}
                          input={<OutlinedInput />}
                          renderValue={(selected) => {
                            let selectedModule = [];
                            if (selected.length === 0) {
                              return <FormattedMessage id="Select Role" />;
                            }
                            userRoles?.data?.forEach((module) => {
                              if (selected.indexOf(module.id) > -1) {
                                selectedModule.push(
                                  `${module.name.toUpperCase()}${module?.department?.short_name
                                    ? ` (${module?.department?.short_name})`
                                    : ""
                                  }`
                                );
                              }
                            });
                            return selectedModule.join(", ");
                          }}
                          MenuProps={MenuProps}
                        >
                          {userRoles?.data?.map((item, index) => (
                            <MenuItem value={item.id} key={"roles_" + index}>
                              <Checkbox
                                checked={values.roles.indexOf(item.id) > -1}
                              />
                              <ListItemText
                                primary={`${item.name.toUpperCase()}${item?.department?.short_name
                                  ? ` (${item?.department?.short_name.toUpperCase()})`
                                  : ""
                                  }`}
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <ShouldRender condition={touched.roles && errors.roles}>
                        <FormHelperText error>{errors.roles}</FormHelperText>
                      </ShouldRender>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.4}>
                      <InputLabel htmlFor="first_name">
                        <Typography variant="span" sx={{ color: "error.main", fontWeight: 600 }}>
                          *{" "}
                        </Typography>
                        <FormattedMessage id="First Name" />
                      </InputLabel>
                      <OutlinedInput
                        id="first_name"
                        name="first_name"
                        type="text"
                        placeholder={intl.formatMessage({
                          id: "Enter First Name",
                        })}
                        variant="outlined"
                        value={values.first_name}
                        error={Boolean(touched.first_name && errors.first_name)}
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        fullWidth
                      />
                      <ShouldRender
                        condition={touched.first_name && errors.first_name}
                      >
                        <FormHelperText error>
                          {errors.first_name}
                        </FormHelperText>
                      </ShouldRender>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.4}>
                      <InputLabel htmlFor="last_name">
                        <FormattedMessage id="Last Name" />{" "}
                      </InputLabel>
                      <OutlinedInput
                        id="last_name"
                        name="last_name"
                        type="text"
                        placeholder={intl.formatMessage({
                          id: "Enter Last Name",
                        })}
                        variant="outlined"
                        value={values.last_name}
                        error={Boolean(touched.last_name && errors.last_name)}
                        onChange={(e) => handleChange(e)}
                        fullWidth
                      />
                      <ShouldRender
                        condition={touched.last_name && errors.last_name}
                      >
                        <FormHelperText error>
                          {errors.last_name}
                        </FormHelperText>
                      </ShouldRender>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.4}>
                      <InputLabel htmlFor="email">
                        <Typography variant="span" sx={{ color: "error.main", fontWeight: 600 }}>
                          *{" "}
                        </Typography>
                        <FormattedMessage id="Email" />
                      </InputLabel>
                      <OutlinedInput
                        id="email"
                        name="email"
                        type="text"
                        placeholder={intl.formatMessage({ id: "Enter Email" })}
                        variant="outlined"
                        value={values.email}
                        error={Boolean(touched.email && errors.email)}
                        onBlur={handleBlur}
                        onChange={(e) => handleChange(e)}
                        fullWidth
                      />
                      <ShouldRender condition={touched.email && errors.email}>
                        <FormHelperText error>{errors.email}</FormHelperText>
                      </ShouldRender>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.4}>
                      <InputLabel htmlFor="mobile">
                        <Typography variant="span" sx={{ color: "error.main", fontWeight: 600 }}>
                          *{" "}
                        </Typography>
                        <FormattedMessage id="Mobile" />
                      </InputLabel>
                      <PhoneInput
                        name="mobile"
                        className="phoneInput"
                        country={"us"}
                        placeholder={intl.formatMessage({
                          id: "Enter phone number",
                        })}
                        countryCodeEditable={false}
                        value={values.mobile}
                        enableSearch="true"
                        containerClass="custom-PhoneInput"
                        disableSearchIcon="true"
                        onChange={(phone) => {
                          setFieldValue("mobile", phone);
                          let phoneWithCountryCode = `+${phone}`;
                          let value = new AsYouType().input(
                            phoneWithCountryCode
                          );
                          let getCountryCode = value.trim().split(/\s+/);
                          if (!countryChange) {
                            setCountryChange(getCountryCode[0]);
                          } else {
                            if (countryChange === getCountryCode[0]) {
                              setFieldValue("mobile", phone);
                            }
                            if (countryChange !== getCountryCode[0]) {
                              setFieldValue("mobile", `+${getCountryCode[0]}`);
                              setCountryChange(getCountryCode[0]);
                            }
                          }
                        }}
                        inputStyle={{
                          width: "100%",
                          height: "32px",
                        }}
                      />
                      <ShouldRender condition={touched.mobile && errors.mobile}>
                        <FormHelperText error>{errors.mobile}</FormHelperText>
                      </ShouldRender>
                      <ShouldRender condition={!errors.mobile}>
                        <FormHelperText error>
                          {<FormattedMessage id="phone-invalid" />}
                        </FormHelperText>
                      </ShouldRender>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.4}>
                      <InputLabel htmlFor="mobile">
                        <Typography variant="span" sx={{ color: "error.main", fontWeight: 600 }}>
                          *{" "}
                        </Typography>
                        <FormattedMessage id="Profile Timezone" />
                      </InputLabel>
                      <FormControl fullWidth>
                        <Autocomplete
                          ListboxProps={{
                            style: {
                              maxHeight: "150px", fontSize: '14px'
                            },
                          }}
                          disablePortal
                          freeSolo
                          options={moment.tz.names()}
                          key={values.profile_timezone}
                          value={values.profile_timezone}
                          onChange={(event, data) => {
                            if (data) {
                              setFieldValue(
                                "profile_timezone",
                                data ? data : ""
                              );
                            }
                          }}
                          disableClearable={
                            values.profile_timezone ? false : true
                          }
                          isOptionEqualToValue={(option, value) =>
                            option.value === value
                          }
                          renderInput={(params) => {
                            return (
                              <TextField
                                {...params}
                                placeholder={intl.formatMessage({
                                  id: "Select Profile Timezone",
                                })}
                                name="profile_timezone"
                                id="profile_timezone"
                                error={Boolean(
                                  errors.profile_timezone &&
                                  touched.profile_timezone
                                )}
                                helperText={
                                  errors.profile_timezone &&
                                    touched.profile_timezone
                                    ? errors.profile_timezone
                                    : ""
                                }
                              />
                            );
                          }}
                        />
                      </FormControl>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sx={{ mt: "10px" }}>
                    <Divider
                      sx={{
                        borderColor: "grey.200",
                        position: "absolute",
                        left: "0px",
                        right: "0px",
                      }}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ pt: 2 }}>
                  <Stack direction="row" justifyContent="space-between">
                    <AnimateButton>
                      <Button
                        size="large"
                        title={intl.formatMessage({ id: "Cancel" })}
                        variant="outlined"
                        className="greyBtn rounded"
                        onClick={() => {
                          if (role_id) {
                            navigate(-1);
                          } else {
                            onClose();
                          }
                        }}
                      >
                        {role_id ? (
                          <FormattedMessage id="Back" />
                        ) : (
                          <FormattedMessage id="Cancel" />
                        )}
                      </Button>
                    </AnimateButton>
                    <AnimateButton>
                      <Button
                        size="large"
                        title={intl.formatMessage({ id: "Save" })}
                        variant="contained"
                        className="rounded"
                        type="submit"
                        disabled={isSubmitting || !dirty}
                      >
                        {id ? (
                          <FormattedMessage id="Update" />
                        ) : (
                          <FormattedMessage id="Save" />
                        )}
                      </Button>
                    </AnimateButton>
                  </Stack>
                </Box>
              </form>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
