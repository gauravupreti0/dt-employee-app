import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getCountries,
  getStates,
  getCities,
  addEmployee,
  getEmployee,
  updateEmployeeData,
} from "../services/services";
import "./employee_form.css";

const EmployeeForm = (data) => {
  // const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [invalidFields, setInvalidFields] = useState({});
  const [additionalUserFields, setAdditionalUserFields] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    mobileNumber: "",
    panNumber: "",
    passportNumber: "",
    dateOfBirth: "",
    dateOfJoinee: "",
    countryId: "",
    stateId: "",
    cityId: "",
    profileImage: "",
    gender: "",
    isActive: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch countries
        const countriesData = await getCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error("Error fetching countries data:", error);
      }
    };
    fetchData();

    const getEmployeeById = async () => {
      const user = await getEmployee(data.employeeId);
      setAdditionalUserFields({
        row_Id: user.row_Id,
        employeeCode: user.employeeCode,
      });
      if (user.countryId) {
        const statesData = await getStates(user.countryId);
        setStates(statesData);
        if (user.stateId) {
          const citiesData = await getCities(user.stateId);
          setCities(citiesData);
        }
      }
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
        mobileNumber: user.mobileNumber,
        panNumber: user.panNumber,
        passportNumber: user.passportNumber,
        dateOfBirth: user.dateOfBirth.split("T")[0],
        dateOfJoinee: user.dateOfJoinee.split("T")[0],
        countryId: user.countryId,
        stateId: user.stateId,
        cityId: user.cityId,
        profileImage: user.profileImage,
        gender: user.gender === 1 ? "male" : "female",
        isActive: user.isActive,
      });
    };

    if (data.employeeId) {
      getEmployeeById();
    }
  }, [data]);

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files) {
      const { name, files } = e.target;
      const file = files[0];
      if (file) {
        if (file.size > 200 * 1024) {
          setInvalidFields({ ...invalidFields, [name]: true });
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          setFormData({
            ...formData,
            [name]: reader.result,
          });
        };
        reader.readAsDataURL(file);
      }
    } else {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
      const isInvalid = !validateInput(name, value);
      setInvalidFields({ ...invalidFields, [name]: isInvalid });
    }
  };

  const validateInput = (name, value) => {
    if (value.trim() === "") {
      return false; // Field is required but has no value
    }

    switch (name) {
      case "firstName":
      case "lastName":
        return /^[A-Za-z]+$/.test(value);
      case "emailAddress":
        return /\S+@\S+\.\S+/.test(value);
      case "dateOfBirth":
        // Check if the selected date is less than or equal to today's date
        const today = new Date();
        const selectedDateOfBirth = new Date(value);
        return selectedDateOfBirth <= today;
      case "dateOfBirth":
        // Check if the selected date is less than or equal to today's date
        selectedDateOfBirth = new Date(value);
        return selectedDateOfBirth <= new Date().setHours(0, 0, 0, 0);
      case "dateOfJoinee":
        // Check if the selected date is at least 18 years later than today's date
        const selectedDateOfJoinee = new Date(value);
        const minJoineeDate = new Date();
        minJoineeDate.setFullYear(minJoineeDate.getFullYear() - 18);
        return (
          selectedDateOfJoinee > minJoineeDate &&
          selectedDateOfJoinee <= new Date().setHours(0, 0, 0, 0)
        );
      default:
    }
  };

  const handleMobileChange = async (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/\D/g, "");
    setFormData({
      ...formData,
      [name]: numericValue,
    });
  };

  const handleCountryChange = async (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    //fetch states
    const statesData = await getStates(value);
    setStates(statesData);
  };

  const handleStateChange = async (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // fetch cities
    const citiesData = await getCities(value);
    setCities(citiesData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.employeeId) {
      await updateEmployee();
    } else {
      await createEmployee();
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    clearFormData();
    const cancelButton = document.querySelector(".swal2-cancel.swal2-styled");
    if (cancelButton) {
      cancelButton.click();
    }
  };

  const clearFormData = () => {
    setFormData({
      firstName: "",
      lastName: "",
      emailAddress: "",
      mobileNumber: "",
      panNumber: "",
      passportNumber: "",
      dateOfBirth: "",
      dateOfJoinee: "",
      countryId: "",
      stateId: "",
      cityId: "",
      profileImage: "",
      gender: "",
      isActive: false,
    });
  };

  const createEmployee = async () => {
    try {
      // adding employee code
      const randomNumber = Math.floor(Math.random() * 1000000);
      const paddedNumber = randomNumber.toString().padStart(6, "0");
      formData["employeeCode"] = `00${paddedNumber}`;

      if (formData.panNumber) {
        formData.panNumber = formData.panNumber.toUpperCase();
      }

      if (formData.passportNumber) {
        formData.passportNumber = formData.passportNumber.toUpperCase();
      }

      if (formData.gender === "male") {
        formData.gender = "1";
      } else {
        formData.gender = "0";
      }
      let isFormValid = true;

      // Check for required fields
      for (const [fieldName, fieldValue] of Object.entries(formData)) {
        if (isRequiredField(fieldName) && fieldValue === "") {
          setInvalidFields({ ...invalidFields, [fieldName]: true });
          isFormValid = false;
        }
      }
      console.log(formData);
      console.log(invalidFields);
      if (isFormValid) {
        await addEmployee(formData);
        console.log("Form submitted successfully!");
        clearFormData();
        Swal.fire("Saved!", "Employee has been saved.", "success");
        // navigate('/employee-list');
      } else {
        Swal.fire("Cancelled", "Employee is not saved.", "info");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire("Error!", error.response.data, "error");
    }
  };

  const isRequiredField = (fieldName) => {
    const requiredFields = [
      "firstName",
      "emailAddress",
      "mobileNumber",
      "panNumber",
      "passportNumber",
      "dateOfBirth",
      "isActive",
    ];
    return requiredFields.includes(fieldName);
  };

  const updateEmployee = async () => {
    try {
      if (formData.panNumber) {
        formData.panNumber = formData.panNumber.toUpperCase();
      }
      if (formData.passportNumber) {
        formData.passportNumber = formData.passportNumber.toUpperCase();
      }
      if (formData.gender === "male") {
        formData.gender = "1";
      } else {
        formData.gender = "0";
      }
      let isFormValid = true;

      // Check for required fields
      for (const [fieldName, fieldValue] of Object.entries(formData)) {
        if (isRequiredField(fieldName) && fieldValue === "") {
          setInvalidFields({ ...invalidFields, [fieldName]: true });
          isFormValid = false;
        }
      }

      if (isFormValid) {
        formData["row_Id"] = additionalUserFields.row_Id;
        formData["employeeCode"] = additionalUserFields.employeeCode;
        await updateEmployeeData(formData);
        console.log("Form submitted successfully!");
        Swal.fire("Updated!", "Employee has been updated.", "success");
        // navigate('/employee-list');
      } else {
        Swal.fire("Cancelled", "Employee is not updated.", "info");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire("Error!", error.response.data, "error");
    }
  };

  return (
    <div className="container mt-5 mb-5 col-6 emp-form" id="employeeForm">
      <h2 className="mb-5 text-center fw-bolder">Employee Registration Form</h2>
      <Form onSubmit={handleSubmit} noValidate>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label className="fw-bold">
              First Name<span className="text-danger">*</span>
            </Form.Label>
          </Col>
          <Col md={8}>
            <Form.Control
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name"
              className={invalidFields.firstName ? "error" : ""}
              maxLength={50}
              required
            />
            {invalidFields.firstName && (
              <div className="error-message">
                Please enter a valid first name (letters only).
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label className="fw-bold">Last Name</Form.Label>
          </Col>
          <Col md={8}>
            <Form.Control
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              className={invalidFields.lastName ? "error" : ""}
              maxLength={50}
            />
            {invalidFields.lastName && (
              <div className="error-message">
                Please enter a valid last name (letters only).
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label className="fw-bold">
              Email<span className="text-danger">*</span>
            </Form.Label>
          </Col>
          <Col md={8}>
            <Form.Control
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleChange}
              placeholder="Email"
              className={invalidFields.emailAddress ? "error" : ""}
              required
            />
            {invalidFields.email && (
              <>
                <div className="error-message">
                  Please enter a valid email address.
                </div>
                <div className="error-message">Email is required.</div>
              </>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label className="fw-bold">
              Mobile<span className="text-danger">*</span>
            </Form.Label>
          </Col>
          <Col md={8}>
            <Form.Control
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleMobileChange}
              placeholder="Mobile"
              maxLength={10}
              required
            />
            {invalidFields.mobileNumber && (
              <div className="error-message">Mobile number is required.</div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label className="fw-bold">
              PAN<span className="text-danger">*</span>
            </Form.Label>
          </Col>
          <Col md={8}>
            <Form.Control
              type="text"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleChange}
              placeholder="Pan Number"
              className="capitalize-fields"
              maxLength={12}
              required
            />
            {invalidFields.panNumber && (
              <div className="error-message">PAN number is required.</div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label className="fw-bold">
              Passport<span className="text-danger">*</span>
            </Form.Label>
          </Col>
          <Col md={8}>
            <Form.Control
              type="text"
              name="passportNumber"
              value={formData.passportNumber}
              onChange={handleChange}
              placeholder="Passport Number"
              className="capitalize-fields"
              maxLength={15}
              required
            />
            {invalidFields.passportNumber && (
              <div className="error-message">Passport number is required.</div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label className="fw-bold">
              Date of Birth<span className="text-danger">*</span>
            </Form.Label>
          </Col>
          <Col md={8}>
            <Form.Control
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              placeholder="Date of birth"
              required
            />
            {invalidFields.dateOfBirth && (
              <div className="error-message">
                {formData.dateOfBirth &&
                  "Date of birth should not be more than today."}
              </div>
            )}
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Label className="fw-bold">Date of Joining</Form.Label>
          </Col>
          <Col md={8}>
            <Form.Control
              type="date"
              name="dateOfJoinee"
              value={formData.dateOfJoinee}
              onChange={handleChange}
              placeholder="Date of joining"
              required
            />
            {invalidFields.dateOfJoinee && (
              <div className="error-message">
                {formData.dateOfJoinee &&
                  formData.dateOfJoinee >
                    new Date().toISOString().slice(0, 10) &&
                  "Please select a date which is less than or equal to today's date."}
                {!formData.dateOfJoinee && "Date of joining is required."}
                {formData.dateOfJoinee &&
                  formData.dateOfBirth &&
                  formData.dateOfJoinee <=
                    new Date().toISOString().slice(0, 10) &&
                  "Please select a date of joining that is at least 18 years later than the date of birth."}
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label className="fw-bold">Country</Form.Label>
          </Col>
          <Col md={8}>
            <Form.Select
              type="text"
              name="countryId"
              value={formData.countryId}
              placeholder="Select Country"
              onChange={handleCountryChange}
              required
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.row_Id} value={country.row_Id}>
                  {country.countryName}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label className="fw-bold">State</Form.Label>
          </Col>
          <Col md={8}>
            <Form.Select
              type="text"
              name="stateId"
              value={formData.stateId}
              onChange={handleStateChange}
              required
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.row_Id} value={state.row_Id}>
                  {state.stateName}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label className="fw-bold">City</Form.Label>
          </Col>
          <Col md={8}>
            <Form.Select
              type="text"
              name="cityId"
              value={formData.cityId}
              onChange={handleChange}
              required
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city.row_Id} value={city.row_Id}>
                  {city.cityName}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label className="fw-bold">Profile Picture</Form.Label>
          </Col>
          <Col md={8}>
            <Form.Control
              type="file"
              name="profileImage"
              placeholder="Upload Profile Picture"
              // value={formData.profileImage}
              onChange={handleChange}
              accept=".jpg, .jpeg, .png"
            />
            {invalidFields.profileImage && (
              <div className="error-message">
                Please upload an image file (jpg, jpeg, or png) with a maximum
                size of 200 KB.
              </div>
            )}
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label className="fw-bold">Gender</Form.Label>
          </Col>
          <Col md={8}>
            <div>
              <Form.Check
                inline
                type="radio"
                label="Male"
                name="gender"
                value="male"
                checked={formData.gender === "male"}
                onChange={handleChange}
              />
              <Form.Check
                inline
                type="radio"
                label="Female"
                name="gender"
                value="female"
                checked={formData.gender === "female"}
                onChange={handleChange}
              />
            </div>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={4}>
            <Form.Label className="fw-bold">
              Active<span className="text-danger">*</span>
            </Form.Label>
            {invalidFields.isActive && (
              <div className="error-message">Active status is required.</div>
            )}
          </Col>
          <Col md={8}>
            <Form.Check
              type="checkbox"
              label="Active"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
            />
          </Col>
        </Row>

        <Row className="mt-5 mb-3">
          <Col className="text-center col-6 mx-auto d-grid">
            <Button
              variant="primary"
              type="submit"
              className="btn btn-success btn-lg"
            >
              {data.employeeId ? "Update" : "Submit"}
            </Button>
          </Col>
          {data.employeeId && (
            <Col className="text-center col-6 mx-auto d-grid">
              <Button
                variant="primary"
                type="button"
                className="btn btn-danger btn-lg"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Col>
          )}
        </Row>
      </Form>
    </div>
  );
};

export default EmployeeForm;
