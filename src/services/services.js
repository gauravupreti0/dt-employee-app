import axios from "axios";

// const apiUrl = "http://localhost:5297/api";
const apiUrl = "./data";

// fetch the list of employees
export const getEmployeeData = async () => {
  try {
    const response = await axios.get("./data/emp_data.json");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAreaData = async () => {
  try {
    const response = await axios.get("./data/area_data.json");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// delete a employee
export const deleteEmployee = async (employeeId) => {
  try {
    const response = await axios.delete(
      `${apiUrl}/Employee/DeleteEmployee/${employeeId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get the list of countries
export const getCountries = async () => {
  try {
    // const response = await axios.get(`${apiUrl}/Employee/GetAllCountryList/`);
    const response = await axios.get(`${apiUrl}/countries.json`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get the list of states
export const getStates = async (countryId) => {
  try {
    // const response = await axios.get(
    //   `${apiUrl}/Employee/GetStateListById/${countryId}`
    // );
    const response = await axios.get(`${apiUrl}/states.json`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get the list of cities
export const getCities = async (stateId) => {
  try {
    const response = await axios.get(
      `${apiUrl}/Employee/GetCitiesListById/${stateId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// add new employee
export const addEmployee = async (data) => {
  try {
    const response = await axios.post(`${apiUrl}/Employee/SaveEmployee/`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get the employee data
export const getEmployee = async (employeeId) => {
  try {
    const response = await axios.get(
      `${apiUrl}/Employee/GetEmployeeById/${employeeId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get the searched data
export const search = async (params) => {
  try {
    const response = await axios.get(
      `${apiUrl}/Employee/Search?searchParam=${params}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// update the employee data
export const updateEmployeeData = async (employeeData) => {
  try {
    const response = await axios.put(
      `${apiUrl}/Employee/UpdateEmployee/`,
      employeeData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
