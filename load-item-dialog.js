/**
 * React Component
 * -----------------------------------------------
 * 
 * This File is responsible to manage the load's items
 * Which have to be delivered
 * 
 * ------------------------------------------------
 * 
 *  - MUI use for ui and formik library is used to handle form and client side validtion
 *  - Multiple Items can be added, updated and deleted.
 *  - Redux tool kit is used for API calling
 * 
 */

import * as Yup from "yup";
import { Formik, Form } from "formik";
import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import { FormattedMessage, useIntl } from "react-intl"; 

// MUI
import {
  Box,
  Stack,
  Grid,
  AppBar,
  Dialog,
  Button,
  IconButton,
  Typography,
  InputLabel,
  DialogTitle,
  DialogContent,
  FormHelperText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { PlusOutlined } from "@ant-design/icons";
import AlertDialog from "components/AlertDialog";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { openSnackbar } from "store/reducers/snackbar";
import InputField from "components/formFields/inputField";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// API and common function, helper
import {
  useDeleteLoadItemMutation,
  useUpdateLoadItemMutation,
} from "apis/apiServices/loadService";
import NoData from "components/noData";
import Loader from "components/Loader";
import ShouldRender from "hooks/shouldRender";
import { FIELD_MAX_LENGTH } from "utils/constants/validation-messages";

export default function LoadItem({
  open,
  onClose,
  packageItems,
  setIsLoadItem,
  setPackageItems,
  setUpdateLoadItem,
  loadItemDialogData,
}) {
  
  // Local states
  const dispatch = useDispatch();
  const [loadItems, setLoadItems] = useState([]);
  const [loadItemDeleteId, setLoadItemDeleteId] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [localLoadItemDeleteId, setLocalLoadItemDeleteId] = useState("");
  const [openLocalDeleteDialog, setOpenLocalDeleteDialog] = useState(false);

  // APIs Call
  const [deleteLoadItem, { isLoading: deleteLoadItemLoading }] =
    useDeleteLoadItemMutation();
  const [updateLoadItem, { isLoading: updateLoadItemLoading }] =
    useUpdateLoadItemMutation();
  const [showCommodityError, setShowCommodityError] = useState(false);
  const [totalLoadItemWeight, setTotalLoadItemWeight] = useState(0);
  
  // Handle take confrimation on delete
  const handleDeleteDialog = (data) => {
    setOpenDeleteDialog(data.id);
  };

  // Dependency on packageItems parent component state
  useEffect(() => {
    if (packageItems?.[loadItemDialogData?.packageIndex]) {
      setLoadItems(packageItems?.[loadItemDialogData?.packageIndex])
    }
  }, [packageItems]);

  // Dependency on loadItems local state
  useEffect(() => {
    setTotalLoadItemWeight(
      loadItems?.reduce((accumulator, currentValue) => {
        return accumulator + Number(currentValue.item_weight);
      }, 0)
    );
  }, [loadItems]);

  // Handle Delete functionality 
  const handleDelete = async () => {

    let response = await deleteLoadItem(openDeleteDialog);

    let color = response?.error ? "error" : "success";
    let message = response?.error
      ? response.error
      : response?.data?.message || "";

    if (response?.data?.message) {
      let removeArr = packageItems.filter((arr) => arr.id !== loadItemDeleteId.id);
      updatePackageItems(removeArr);
    }

    dispatch(
      openSnackbar({
        open: true,
        message,
        alert: { color },
      })
    );
    setUpdateLoadItem(true);
    setOpenDeleteDialog(false);
  };

  // Handle update functionality 
  const handleUpdate = async (val, itemIndex) => {
    let response = await updateLoadItem(val);

    let color = response?.error ? "error" : "success";
    let message = response?.error
      ? response.error
      : response?.data?.message || "";

    if (color === "success") {

      let packageItemTemp = { ...packageItems };

      let items = [...packageItemTemp?.[loadItemDialogData?.packageIndex]];

      items[itemIndex] = {
        id: val.id,
        name: val?.data?.name || "",
        quantity: parseInt(val?.data?.item_quantity) || 1,
        item_weight: parseInt(val?.data?.item_weight),
      }

      setPackageItems({ [loadItemDialogData?.packageIndex]: items })

    }

    dispatch(
      openSnackbar({
        open: true,
        message,
        alert: { color },
      })
    );
  };

  const updatePackageItems = (data) => {
    let tempPackageItems = { ...packageItems };
    if (data?.length > 0) {
      tempPackageItems[loadItemDialogData?.packageIndex] = data;
    } else if (tempPackageItems[loadItemDialogData?.packageIndex]) {
      delete tempPackageItems[loadItemDialogData?.packageIndex];
    }
    setPackageItems(tempPackageItems);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth
      maxWidth="md"
    >
      {updateLoadItemLoading && <Loader />}
      <AppBar sx={{ position: "relative", boxShadow: 0 }}>
        <DialogTitle id="alert-dialog-title" component="div">
          <Typography variant="h4" color="inherit">
            <FormattedMessage id="Add Load Item" />
          </Typography>
          <IconButton
            aria-label="close"
            size="small"
            onClick={onClose}
            color="inherit"
            sx={{
              position: "absolute",
              right: 8,
              top: 12,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      </AppBar>
      <DialogContent sx={{ mt: 1 }} id="alert-dialog-description">
        <React.Fragment>
          <Stack
            sx={{
              minHeight: "300px",
              maxHeight: "300px",
              overflow: "auto",
              pr: 1,
            }}
          >
            <Formik
              initialValues={{
                item_name: "",
                item_quantity: 1,
                item_weight: 1
              }}
              enableReinitialize={true}
              validationSchema={Yup.object().shape({
                item_name: Yup.string().required(
                  <FormattedMessage
                    id="input-required"
                    values={{ field: "name" }}
                  />
                ).max(
                  FIELD_MAX_LENGTH.LOAD_ITEM_NAME_MAX,
                  <FormattedMessage
                    id="number-character-max"
                    values={{
                      field: <FormattedMessage id="name" />,
                      max: FIELD_MAX_LENGTH.LOAD_ITEM_NAME_MAX,
                    }}
                  />
                ),
                item_quantity: Yup.string().max(
                  FIELD_MAX_LENGTH.LOAD_ITEMS_QUANTITY_MAX,
                  <FormattedMessage
                    id="number-character-max"
                    values={{
                      field: <FormattedMessage id="item_quantity" />,
                      max: FIELD_MAX_LENGTH.LOAD_ITEMS_QUANTITY_MAX,
                    }}
                  />
                ),
                item_weight: Yup.string().required(
                  <FormattedMessage
                    id="input-required"
                    values={{ field: "quantity" }}
                  />
                ).max(
                  FIELD_MAX_LENGTH.LOAD_ITEMS_WEIGHT_MAX,
                  <FormattedMessage
                    id="number-character-max"
                    values={{
                      field: <FormattedMessage id="item_weight" />,
                      max: FIELD_MAX_LENGTH.LOAD_ITEMS_WEIGHT_MAX,
                    }}
                  />
                ),
              })}
            >
              {({ values, setFieldValue, setTouched, dirty }) => {
                return (
                  <Form>
                    <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ py: 1 }}>
                       <Grid item xs={12} sm={6} md={4}>
                        <Stack spacing={0.4}>
                          <InputLabel>
                            <Typography variant="span" sx={{ color: "error.main", fontWeight: 600 }}>
                              *{" "}
                            </Typography>
                            <FormattedMessage id="Load Item Name" />
                          </InputLabel>
                          <Box sx={{ position: "relative" }}>
                            <InputField
                              name="item_name"
                              sx={{ width: "100%" }}
                            />
                          </Box>
                        </Stack>
                      </Grid>
                       <Grid item xs={12} sm={6} md={3}>
                       <Stack spacing={0.4}>
                            <InputLabel>
                          <Typography variant="span" sx={{ color: "error.main", fontWeight:600 }}>
                            *{" "}
                          </Typography>
                          <FormattedMessage id="quantity" />
                        </InputLabel>
                            <Box sx={{ position: "relative" }}>
                              <Button
                                className="numberBtn plus"
                                onClick={() => {
                                  let value = Number(values.item_quantity);
                                  values.item_quantity
                                    ? setFieldValue("item_quantity", value + 1)
                                    : setFieldValue("item_quantity", 1);
                                }}
                              >
                                <ExpandLessIcon />
                              </Button>
                              <Button
                                className="numberBtn minus"
                                onClick={() =>
                                  Number(values.item_quantity) > 1
                                    ? setFieldValue(
                                      "item_quantity",
                                      parseInt(values.item_quantity) - 1
                                    )
                                    : setFieldValue("item_quantity", 1)
                                }
                              >
                                <ExpandMoreIcon />
                              </Button>
                              <InputField
                                name="item_quantity"
                                sx={{ width: "100%" }}
                                value={values.item_quantity}
                                onKeyPress={(event) => {
                                  if (!/[0-9]/.test(event.key)) {
                                    event.preventDefault();
                                  }
                                }}
                                onChange={(e) => {
                                  if (e.target.value && e.target.value?.length > 0) {
                                    setFieldValue(
                                      "item_quantity",
                                      parseInt(e.target.value)
                                    );
                                  } else {
                                    setFieldValue(
                                      "item_quantity",
                                      1
                                    );
                                  }
                                }}
                              />
                            </Box>
                            </Stack>
                        </Grid>
                       <Grid item xs={12} sm={6} md={5}>
                       <Grid container spacing={{ xs: 1.5, md: 2 }}>
                            <Grid item xs={12} sm={6} md={9}>
                             <Stack spacing={0.4}>
                            <InputLabel>
                              {loadItemDialogData?.commodityUnits ? (
                                <>
                                <Typography variant="span" sx={{ color: "error.main", fontWeight: 600 }}>
                                  *
                                  {" "}
                                </Typography>
                                <FormattedMessage
                                  id="weight"
                                  values={{
                                    weight: loadItemDialogData?.commodityUnits,
                                  }}
                                />
                                </>
                              ) : (
                                <>
                                <Typography variant="span" sx={{ color: "error.main", fontWeight: 600 }}>
                                  *
                                  {" "}
                                </Typography>
                                <FormattedMessage id="Weight (in lbs)" />
                                </>
                              )}
                            </InputLabel>
                            <Box sx={{ position: "relative" }}>
                              <InputField
                                name="item_weight"
                                sx={{ width: "100%" }}
                                type="number"
                                inputProps={{ min: 1 }}
                              />
                            </Box>
                            </Stack>
                           </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                            <Stack spacing={0.4}>
                          <IconButton
                            onClick={() => {
                              setShowCommodityError(false);
                              if (
                                loadItemDialogData?.commodityWeight &&
                                Number(loadItemDialogData?.commodityWeight) >= Number(Number(values.item_weight) + Number(totalLoadItemWeight))

                              ) {
                                setTouched({}, false);
                                setFieldValue("item_name", "");
                                setFieldValue("item_quantity", 1);
                                setFieldValue("item_weight", "");

                                let tempPackageItems = { ...packageItems };

                                if (!tempPackageItems[loadItemDialogData?.packageIndex]) {
                                  tempPackageItems[loadItemDialogData?.packageIndex] = [];
                                }

                                tempPackageItems[loadItemDialogData?.packageIndex].push({
                                  temp_id: Math.round(new Date() / 1000),
                                  name: values.item_name,
                                  quantity: String(
                                    values.item_quantity
                                      ? values.item_quantity
                                      : 1
                                  ),
                                  item_weight: values.item_weight
                                });

                                setPackageItems(tempPackageItems);
                                setTotalLoadItemWeight((pre) => Number(pre) + Number(values.item_weight))
                                setIsLoadItem(true);
                              } else {
                                setShowCommodityError("add");
                              }
                            }}
                            disabled={
                              values.item_name.length === 0 || !values.item_weight ? true : false
                            }
                            color="secondary"
                            title="Add Item"
                            sx={{ mt: 2.5 }}
                          >
                            <PlusOutlined style={{ fontSize: "18px" }} />
                          </IconButton>
                          </Stack>
                           </Grid>
                        </Grid> 
                        </Grid>        
                        <ShouldRender
                          condition={
                            values.item_quantity &&
                            showCommodityError &&
                            showCommodityError === "add" &&
                            loadItemDialogData?.commodityWeight &&
                            Number(loadItemDialogData?.commodityWeight) <=
                            Number(Number(values.item_weight) + Number(totalLoadItemWeight))
                          }
                        >
                          <FormHelperText error>
                            <FormattedMessage
                              id="load-item-limit"
                              values={{
                                weight: loadItemDialogData?.commodityWeight,
                              }}
                            />
                          </FormHelperText>
                        </ShouldRender>
                        <ShouldRender condition={!loadItemDialogData?.commodityWeight}>
                          <FormHelperText error>
                            <FormattedMessage id="valid-commodity-item" />
                          </FormHelperText>
                        </ShouldRender>
                      </Grid>
                  </Form>
                );
              }}
            </Formik>
            {/* List with edit and delete */}
            {loadItems?.length > 0 ? (
              loadItems?.map((item, index) => {
                return (
                  <Formik
                    key={`loadItem_${index}`}
                    initialValues={{
                      item_name: item?.name?.toString() || "",
                      item_quantity: parseInt(item?.quantity) || "",
                      item_weight: parseInt(item?.item_weight) || "",
                    }}
                    enableReinitialize={true}
                    validationSchema={Yup.object().shape({
                      item_name: Yup.string().required(
                        <FormattedMessage
                          id="input-required"
                          values={{ field: "item name" }}
                        />
                      ),
                      item_quantity: Yup.string().required(
                        <FormattedMessage
                          id="input-required"
                          values={{ field: "item quantity" }}
                        />
                      ),
                      item_weight: Yup.string().required(
                        <FormattedMessage
                          id="input-required"
                          values={{ field: "item weight" }}
                        />
                      ),
                    })}
                  >
                    {({ values, setFieldValue, dirty }) => {
                      return (
                        <Form>
                          <Grid
                            container
                            spacing={{ xs: 1.5, md: 2 }}
                            sx={{ pt: 2, pb: 1 }}
                          >
                            <Grid item xs={12} sm={6} md={4}>
                              <Stack spacing={0.4}>
                                <InputField
                                  name="item_name"
                                  sx={{ width: "100%" }}
                                  onChange={(e) => {
                                    setFieldValue("item_name", e.target.value);
                                  }}
                                />
                              </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Stack spacing={1} flexGrow="1">
                                      <Box sx={{ position: "relative" }}>
                                        <Button
                                          className="numberBtn plus"
                                          onClick={() => {
                                            values.item_quantity
                                              ? setFieldValue(
                                                "item_quantity",
                                                parseInt(
                                                  values.item_quantity
                                                ) + 1
                                              )
                                              : setFieldValue(
                                                "item_quantity",
                                                1
                                              );
                                          }}
                                        >
                                          <ExpandLessIcon />
                                        </Button>
                                        <Button
                                          className="numberBtn minus"
                                          onClick={() => {
                                            if (values.item_quantity > 1) {
                                              values.item_quantity
                                                ? setFieldValue(
                                                  "item_quantity",
                                                  parseInt(
                                                    values.item_quantity
                                                  ) - 1
                                                )
                                                : setFieldValue(
                                                  "item_quantity",
                                                  1
                                                );
                                            }
                                          }}
                                        >
                                          <ExpandMoreIcon />
                                        </Button>
                                        <InputField
                                          name="item_quantity"
                                          sx={{ width: "100%" }}
                                          onKeyPress={(event) => {
                                            if (!/[0-9]/.test(event.key)) {
                                              event.preventDefault();
                                            }
                                          }}
                                          onChange={(e) => {
                                            if (e.target.value && e.target.value?.length > 0) {
                                              setFieldValue(
                                                "item_quantity",
                                                parseInt(e.target.value)
                                              );
                                            } else {
                                              setFieldValue(
                                                "item_quantity",
                                                1
                                              );
                                            }
                                          }}
                                        />
                                      </Box>
                                    </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={5}>
                                <Grid container spacing={{ xs: 1.5, md: 2 }}>
                                 <Grid item xs={12} sm={6} md={9}>
                                  <Stack spacing={0.4} flexGrow="1">
                                    <Box sx={{ position: "relative" }}>
                                      <InputField
                                        name="item_weight"
                                        sx={{ width: "100%" }}
                                        type="number"
                                        inputProps={{ min: 1 }}
                                      />
                                    </Box>
                                  </Stack>
                                </Grid>   
                                 <Grid item xs={12} sm={6} md={3}>
                              <Box sx={{ display: "flex" }}>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                >
                                  <IconButton
                                    disabled={!dirty}
                                    color="secondary"
                                    title="Edit Item"
                                    onClick={(e) => {
                                      setShowCommodityError(false);
                                      let tempLoadItem = [];
                                      loadItems.forEach((data) => {
                                        if (
                                          data?.id && item?.id
                                            ? data?.id === item?.id
                                            : false
                                        ) {
                                          tempLoadItem.push({
                                            ...data,
                                            quantity: values.item_quantity,
                                          });
                                        } else if (
                                          data?.temp_id && item?.temp_id
                                            ? data?.temp_id === item?.temp_id
                                            : false
                                        ) {
                                          tempLoadItem.push({
                                            ...data,
                                            quantity: values.item_quantity,
                                          });
                                        } else {
                                          tempLoadItem.push(data);
                                        }
                                      }
                                      );

                                      let updatedTotalCount =
                                        tempLoadItem.filter((_, recordIndex) => recordIndex !== index)?.reduce(
                                          (accumulator, currentValue) => {
                                            return (
                                              Number(accumulator) +
                                              Number(currentValue.item_weight)
                                            );
                                          },
                                          0
                                        );
                                      if (
                                        loadItemDialogData?.commodityWeight &&
                                        Number(loadItemDialogData?.commodityWeight) >= Number(Number(updatedTotalCount) + Number(values.item_weight))
                                      ) {
                                        if (item.id) {
                                          handleUpdate({
                                            id: item.id,
                                            data: {
                                              name: values.item_name,
                                              quantity: values?.item_quantity ? parseInt(values?.item_quantity) : 1,
                                              item_weight: parseInt(values.item_weight),
                                            },
                                          }, index);
                                        } else if (item.temp_id) {
                                          let updateLoad = [];
                                          for (
                                            let i = 0;
                                            i < loadItems.length;
                                            i++
                                          ) {
                                            if (
                                              loadItems[i].temp_id ===
                                              item.temp_id
                                            ) {
                                              updateLoad.push({
                                                temp_id: loadItems[i].temp_id,
                                                name: values.item_name,
                                                quantity: String(
                                                  values.item_quantity &&
                                                  parseInt(
                                                    values.item_quantity
                                                  )
                                                ),
                                                item_weight: Number(values.item_weight),
                                              });
                                            } else {
                                              updateLoad.push(loadItems[i]);
                                            }
                                          }
                                          updatePackageItems(updateLoad)
                                          dispatch(
                                            openSnackbar({
                                              open: true,
                                              message:
                                                "Load Item Updated Successfully",
                                              alert: { color: "success" },
                                            })
                                          );
                                        }
                                      } else {
                                        setShowCommodityError(
                                          item.id ? item.id : item.temp_id
                                        );
                                      }
                                    }}
                                    >
                                    <EditIcon style={{ fontSize: "18px" }} />
                                  </IconButton>
                                  <IconButton
                                    color="error"
                                    title="Delete Item"
                                    onClick={() => {
                                      if (item.id) {
                                        handleDeleteDialog(item);
                                        setLoadItemDeleteId(item);
                                      } else {
                                        setOpenLocalDeleteDialog(true);
                                        setLocalLoadItemDeleteId(item.temp_id);
                                      }
                                    }}
                                  >
                                    <DeleteIcon style={{ fontSize: "18px" }} />
                                  </IconButton>
                                </Stack>
                              </Box>
                              <ShouldRender
                                condition={
                                  showCommodityError &&
                                  (showCommodityError === item.id ||
                                    showCommodityError === item.temp_id) &&
                                  loadItemDialogData?.commodityWeight &&
                                  Number(loadItemDialogData?.commodityWeight) <=
                                  Number(
                                    Number(totalLoadItemWeight) +
                                    Number(values.item_weight)
                                  )
                                }
                              >
                                <FormHelperText error>
                                  <FormattedMessage
                                    id="load-item-limit"
                                    values={{
                                      weight: loadItemDialogData?.commodityWeight,
                                    }}
                                  />
                                </FormHelperText>
                              </ShouldRender>
                            </Grid>
                          </Grid> </Grid>
                          </Grid>
                        </Form>
                      );
                    }}
                  </Formik>
                );
              })
            ) : (
              <NoData />
            )}
          </Stack>
          <AlertDialog
            open={openDeleteDialog ? true : false}
            message={<FormattedMessage id="delete-load-item-confirmation" />}
            onClose={() => setOpenDeleteDialog(false)}
            onConfirm={handleDelete}
            isLoading={deleteLoadItemLoading}
          />
          <AlertDialog
            open={openLocalDeleteDialog ? true : false}
            message={<FormattedMessage id="delete-load-item-confirmation" />}
            onClose={() => setOpenLocalDeleteDialog(false)}
            onConfirm={() => {
              let removeData = [...loadItems];
              let final = removeData.filter((data) => {
                if (data.temp_id !== localLoadItemDeleteId) return data;
              });
              updatePackageItems(final);
              dispatch(
                openSnackbar({
                  open: true,
                  message: "Load Item Deleted Successfully.",
                  alert: { color: "success" },
                })
              );
              setOpenLocalDeleteDialog(false);
              setUpdateLoadItem(true);
            }}
          />
        </React.Fragment>
      </DialogContent>
    </Dialog>
  );
}
