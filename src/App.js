import "./App.css";
import { BrowserRouter as Router, Route, Switch, Routes } from 'react-router-dom';
import EmployeeForm from "./employee_form/employee_form";
import Header from "./header/header";
import EmployeeList from "./employee_list/employee_list";

function App() {
  return (
    // <div className="row justify-content-center custom-row">
    //   <Header></Header>
    //   <div className="col-6">
    //     <EmployeeForm></EmployeeForm>
    //   </div>
    //   <div className="col-10">
    //     <EmployeeList></EmployeeList>
    //   </div>
    // </div>


    <Router>
      <div className="row justify-content-center custom-row">
        <Header></Header>

        <Routes>
          <Route exact path="/" element={<EmployeeForm />} />
          <Route path="/employee-list" element={<EmployeeList />} />
          <Route path="/employee-form" element={<EmployeeForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
