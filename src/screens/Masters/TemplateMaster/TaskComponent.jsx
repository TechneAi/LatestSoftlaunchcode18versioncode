import React, { useState, useRef, useEffect } from "react";
import TemplateService from "../../../services/MastersService/TemplateService";
import { useParams } from "react-router-dom";
import { _base } from "../../../settings/constants";
import Alert from "../../../components/Common/Alert";
import { ExportToExcel } from "../../../components/Utilities/Table/ExportToExcel";
import TaskTicketTypeService from "../../../services/MastersService/TaskTicketTypeService";
import Select from "react-select";
export default function TaskComponent(props) {
  const [data, setData] = useState({ task: props.taskData.task_name });
  const [notify, setNotify] = useState(null);

  const [show, setShow] = useState(false);

  const [stack, setStack] = useState();

  const [exportData, setExportData] = useState(null);

  const searchRef = useRef();
  const handleSearch = (e) => {
    const search = searchRef.current.value;
    if (search.length > 0) {
      const temp = data.filter((d) => {
        return d.department
          .toLowerCase()
          .match(new RegExp(search.toLowerCase(), "g"));
      });

      setData(temp);
    }
  };

  var oo = props.taskData.AB;

  const handleTaskDelete = (e, idx) => {
    var temp = { is_active: 0 };
    new TemplateService().deleteTask(idx, temp).then((res) => {
      if (res.status == 200) {
        props.refreshData(id);
      }
    });
  };

  const handleShow = () => {
    setShow((prev) => !prev);
  };

  const handleChange = (e, type) => {
    if (type === "select2") {
      // Assuming e is an object like { value: 8, label: 'Task type test' }
      const selectedValue = e.value; // Access the 'value' property
  
      console.log(selectedValue);
  
      // Assuming the name is 'task_type_id', you can adjust it as needed
      const name = "task_type_id";
  
      const updatedData = { ...data, [name]: selectedValue };
      setData(updatedData);
    } else {
      // Handle standard input elements
      const { name, value } = e.target;
  
      console.log(value);
  
      const updatedData = { ...data, [name]: value };
      setData(updatedData);
    }
  };
  
  
  
  const [taskTypeDropdown, setTaskTypeDropdown] = useState();
  useEffect(async () => {
    await new TaskTicketTypeService().getAllType().then((res) => {
      if (res.status === 200) {
        if (res.data.status == 1) {
          const temp = res.data.data;
          setTaskTypeDropdown(
            temp
              .filter((d) => d.type === "TASK" && d.is_active == 1)
              .map((d) => ({ value: d.id, label: d.type_name }))
          );
        }
      }
    });
  }, []);
  const { id } = useParams();

  const handleSubmit = (e) => {
    setNotify(null);
    e.preventDefault();
    new TemplateService()
      .updateTask(props.taskData.task_id, data)
      .then((res) => {
        if (res.status === 200) {
          if (res.data.status == 1) {
            props.refreshData(id);
            setNotify({ type: "success", message: res.data.message });
            setShow(false);
          } else {
            setNotify({ type: "danger", message: res.data.message });
          }
        } else {
          setNotify({ type: "danger", message: res.data.message });
        }
      });
  };

  return (
    <div
      className="card mt-1 card-body d-flex justify-content-between mt-3"
      style={{ borderRadius: "10px", boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)" }}
    >
      {notify && <Alert alertData={notify} />}

      {!show && (
        <p>
          <strong>{props.taskData.task_name}</strong>
          <span style={{ float: `right` }}>
            {props.taskData.start_days} days
          </span>
        </p>
      )}
      {!show && (
        <div>
          <button
            className="btn btn-sm btn-danger"
            onClick={(e) => {
              if (window.confirm("Are you sure to delete this record?")) {
                handleTaskDelete(e, props.taskData.task_id);
              }
            }}
          >
            <i className="icofont-ui-delete"></i>
          </button>
          <button className="btn btn-sm btn-primary" onClick={handleShow}>
            <i className="icofont-ui-edit" color="white"></i>
          </button>
        </div>
      )}
      {show && (
        <>
          <p>
            {props.taskData.task_name}
            <span style={{ float: `right` }}>
              {props.taskData.task_total_time} Days
            </span>
          </p>
          <div>
            <button
              className="btn btn-sm btn-danger"
              onClick={(e) => {
                if (window.confirm("Are you sure to delete this record?")) {
                  handleTaskDelete(e, props.taskData.task_id);
                }
              }}
            >
              <i className="icofont-ui-delete"></i>
            </button>
            <button className="btn btn-sm btn-primary" onClick={handleShow}>
              <i className="icofont-ui-edit"></i>
            </button>
          </div>
          <div
            className="modal fade show"
            id="createproject"
            tabIndex="-1"
            aria-modal="true"
            role="dialog"
            style={{ display: `block` }}
          >
            <div className="modal-dialog modal-dialog-centered modal-md modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title  fw-bold" id="createprojectlLabel">
                    Update task
                  </h5>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleShow}
                  >
                    <i className="icofont-ui-close"></i>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    {show && (
                      <div className="">
                        <label>Task Name</label>
                        <input
                          className="col-7 form-control form-control-sm"
                          defaultValue={props.taskData.task_name}
                          name="task"
                          onInput={e=>handleChange(e, "standard")}
                        />
                        <br />

                        <label>
                          <b>
                            Task Type :
                          </b>
                        </label>
                        <Select
                          id="task_type_id"
                          name="task_type_id"
                          onChange={e=>handleChange(e,"select2")}
                          className="col-7 form-control form-control-sm"
                          options={taskTypeDropdown && taskTypeDropdown}
                          defaultValue={
                            taskTypeDropdown &&
                            taskTypeDropdown.filter(
                              (d) =>
                                d.value == props.taskData.task_type_id
                            )
                          }
                        />
                        <br />
                        <label>Days Required</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className="form-control form-control-sm"
                          defaultValue={props.taskData.task_days}
                          name="days"
                          onInput={e=>handleChange(e, "standard")}                        />
                        <br />
                        <label>Hours Required</label>
                        <input
                          className="form-control form-control-sm"
                          defaultValue={
                            props.taskData.total_hours
                              ? props.taskData.total_hours
                              : "00.00"
                          }
                          name="total_time"
                          onInput={e=>handleChange(e, "standard")}                        />
                        <br />
                        <label>
                          Start task{" "}
                          {props.taskData.AB === "START_FROM"
                            ? "after"
                            : "before"}{" "}
                          days :
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className="form-control form-control-sm"
                          defaultValue={props.taskData.start_days}
                          name="start_days"
                          onInput={e=>handleChange(e, "standard")}                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
