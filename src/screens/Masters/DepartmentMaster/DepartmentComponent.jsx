import React, { useEffect, useState, useRef } from "react";
import { Modal } from "react-bootstrap";
import DataTable from "react-data-table-component";
import ErrorLogService from "../../../services/ErrorLogService";
import DepartmentService from "../../../services/MastersService/DepartmentService";
import ManageMenuService from '../../../services/MenuManagementService/ManageMenuService'
import PageHeader from "../../../components/Common/PageHeader";
import Select from 'react-select';
import { Astrick } from '../../../components/Utilities/Style';
import *  as Validation from '../../../components/Utilities/Validation';
import Alert from "../../../components/Common/Alert";
import { ExportToExcel } from '../../../components/Utilities/Table/ExportToExcel'

function DepartmentComponent() {

    const [data, setData] = useState(null);
    const [dataa, setDataa] = useState(null)
    const [notify, setNotify] = useState();

    const [modal, setModal] = useState({ showModal: false, modalData: "", modalHeader: "" });

    const [exportData, setExportData] = useState(null)

    const roleId = sessionStorage.getItem("role_id")
    const [checkRole, setCheckRole] = useState(null)

    const handleModal = (data) => {
        setModal(data);
    }

    const searchRef = useRef()


    function SearchInputData(data, search) {
        const lowercaseSearch = search.toLowerCase();
    
        return data.filter((d) => {
          for (const key in d) {
            if (
              typeof d[key] === "string" &&
              d[key].toLowerCase().includes(lowercaseSearch)
            ) {
              return true;
            }
          }
          return false;
        });
      }
    
    
    
    
    
      const handleSearch = () => {
        const SearchValue = searchRef.current.value;
        const result = SearchInputData(data, SearchValue);
        setData(result);
      };
    
 
    

    const columns = [
        {
            name: "Action", selector: (row) => { }, sortable: false,width: "80px",
            cell: (row) =>
                <div className="btn-group" role="group" >
                    <button type="button" className="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#edit"
                        onClick={(e) => {
                            handleModal({ showModal: true, modalData: row, modalHeader: 'Edit Department' })
                        }}
                    ><i className="icofont-edit text-success"></i>
                    </button>
                </div>
        },
        { name: "Sr", selector: (row) => row.counter, sortable: true,width: "60px", },
        { name: "Department", selector: (row) => row.department, sortable: true,width: "175px", },
        {
            name: "Status", selector: (row) => row.is_active, sortable: true,
            cell: (row) => <div>
                {row.is_active === 1 && <span className="badge bg-primary" style={{width:"4rem"}}>Active</span>}
                {row.is_active === 0 && <span className="badge bg-danger" style={{width:"4rem"}}>Deactive</span>}
            </div>
        },
        { name: 'Created At', selector: (row) => row.created_at, sortable: true, width: "175px" },
        { name: 'Created By', selector: (row) => row.created_by, sortable: true, width: "175px"},
        { name: "Updated At", selector: (row) => row.updated_at, sortable: true , width: "175px"},
        { name: "Updated By", selector: (row) => row.updated_by, sortable: true, width: "175px" },
    ];

    const loadData = async () => {
        const data = [];
        const exportTempData = [];
        await new DepartmentService().getDepartment().then(res => {
            if (res.status === 200) {
                let counter = 1;
                const temp = res.data.data
                for (const key in temp) {
                    data.push({
                        counter: counter++,
                        id: temp[key].id,
                        department: temp[key].department,
                        is_active: temp[key].is_active,
                        remark: temp[key].remark,
                        created_at: temp[key].created_at,
                        created_by: temp[key].created_by,
                        updated_at: temp[key].updated_at,
                        updated_by: temp[key].updated_by
                    })
                }
                setData(null);
                setData(data);
                setDataa(data)
                for (const i in data) {
                    exportTempData.push({
                        Sr: data[i].counter,
                        Department: data[i].department,
                        Status: data[i].is_active ? 'Active' : 'Deactive',
                        Remark:data[i].remark,
                        created_at: temp[i].created_at,
                        created_by: temp[i].created_by,
                        updated_at: data[i].updated_at,
                        updated_by: data[i].updated_by,
                    })
                }

                setExportData(null)
                setExportData(exportTempData)
            }
        }).catch(error => {
            const { response } = error;
            const { request, ...errorObject } = response;
            new ErrorLogService().sendErrorLog("Department", "Get_Department", "INSERT", errorObject.data.message);
        })

        await new ManageMenuService().getRole(roleId).then((res) => {
            if (res.status === 200) {
                if (res.data.status == 1) {
                    const getRoleId = sessionStorage.getItem("role_id");
                    setCheckRole(res.data.data.filter(d => d.role_id == getRoleId))

                }
            }
        })
    }

    const handleForm = id => async (e) => {
        e.preventDefault();
        setNotify(null);
        const form = new FormData(e.target);
        if (!id) {

            await new DepartmentService().postDepartment(form).then(res => {
                if (res.status === 200) {
                    if (res.data.status === 1) {
                        setNotify({ type: 'success', message: res.data.message })
                        setModal({ showModal: false, modalData: "", modalHeader: "" });
                        loadData();
                    } else {

                        setNotify({ type: 'danger', message: res.data.message })
                    }
                } else {
                    setNotify({ type: 'danger', message: res.data.message })
                    new ErrorLogService().sendErrorLog("Department", "Create_Department", "INSERT", res.message);
                }
            }).catch(error => {
                const { response } = error;
                const { request, ...errorObject } = response;
                setNotify({ type: 'danger', message: "Request Error !!!" })
                new ErrorLogService().sendErrorLog("Department", "Create_Department", "INSERT", errorObject.data.message);
            })
        } else {
            await new DepartmentService().updateDepartment(id, form).then(res => {
                if (res.status === 200) {
                    if (res.data.status == 1) {
                        setNotify({ type: 'success', message: res.data.message })
                        setModal({ showModal: false, modalData: "", modalHeader: "" });
                        loadData();
                    } else {
                        setNotify({ type: 'danger', message: res.data.message })
                    }
                } else {
                    setNotify({ type: 'danger', message: res.message })
                    new ErrorLogService().sendErrorLog("Department", "Edit_Department", "INSERT", res.message);
                }
            }).catch(error => {
                const { response } = error;
                const { request, ...errorObject } = response;
                setNotify({ type: 'danger', message: "Request Error !!!" })
                new ErrorLogService().sendErrorLog("Department", "Edit_Department", "INSERT", errorObject.data.message);
            })
        }
    }

    //Search As Enter key press
    // useEffect(() => {
    //     const listener = event => {
    //         if (event.code === "Enter") {
    //             console.log("Enter key was pressed. Run your function.");
    //             // callMyFunction();
    //             handleSearch()
    //         }
    //     };
    //     document.addEventListener("keydown", listener);
    //     return () => {
    //         document.removeEventListener("keydown", listener);
    //     };
    // }, [data]);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSearch()
        }
    };

    useEffect(() => {
        loadData();
    }, [])

    return (
        <div className="container-xxl">
            {notify && <Alert alertData={notify} />}

            <PageHeader headerTitle="Department Master" renderRight={() => {
                return <div className="col-auto d-flex w-sm-100">
                    {checkRole && checkRole[8].can_create === 1 ?
                        <button className="btn btn-dark btn-set-task w-sm-100" onClick={() => { handleModal({ showModal: true, modalData: null, modalHeader: 'Add Department' }) }}>
                            <i className="icofont-plus-circle me-2 fs-6"></i>Add Department
                        </button> : ""}
                </div>
            }} />

            <div className="card card-body">
                <div className="row">
                    <div className="col-md-9">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by Department Name...."
                            ref={searchRef}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    <div className="col-md-3">
                        <button
                            className="btn btn-sm btn-warning text-white"
                            type="button"
                            onClick={handleSearch}
                            style={{ marginTop: '0px', fontWeight: '600' }}
                        >
                            <i className="icofont-search-1 "></i> Search
                        </button>
                        <button
                            className="btn btn-sm btn-info text-white"
                            type="button"
                            onClick={() => window.location.reload(false)}
                            style={{ marginTop: '0px', fontWeight: '600' }}
                        >
                            <i className="icofont-refresh text-white"></i> Reset
                        </button>
                        <ExportToExcel
                            className="btn btn-sm btn-danger"
                            apiData={exportData}
                            fileName="Department master Records"
                        />
                    </div>
                </div>
            </div>

            <div className='card mt-2'>
                <div className='card-body'>
                    <div className="row clearfix g-3">
                        <div className="col-sm-12">
                            {data && <DataTable
                                columns={columns}
                                data={data}
                                defaultSortField="title"
                                pagination
                                selectableRows={false}
                                className="table myDataTable table-hover align-middle mb-0 d-row nowrap dataTable no-footer dtr-inline"
                                highlightOnHover={true}
                            />
                            }
                        </div>
                    </div>
                </div>
            </div>

            <Modal centered show={modal.showModal}
                onHide={(e) => {
                    handleModal({
                        showModal: false,
                        modalData: "",
                        modalHeader: ""
                    })
                }}>
                <form method="post" onSubmit={handleForm(modal.modalData ? modal.modalData.id : '')}>

                    <Modal.Header closeButton>
                        <Modal.Title className="fw-bold">{modal.modalHeader}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>

                        <div className="deadline-form">

                            <div className="row g-3 mb-3">

                                <div className="col-sm-12">
                                    <label className="form-label font-weight-bold">Department Name :<Astrick color="red" size="13px" /></label>
                                    <input type="text"
                                        className="form-control form-control-sm"
                                        id="department"
                                        name="department"
                                        required
                                        maxLength={30}
                                        defaultValue={modal.modalData ? modal.modalData.department : ""}
                                        onKeyPress={e => { Validation.CharacterWithSpace(e) }}
                                        onPaste={(e) => {
                                            e.preventDefault()
                                            return false;
                                        }} onCopy={(e) => {
                                            e.preventDefault()
                                            return false;
                                        }}
                                    />
                                </div>
                                <div className="col-sm-12">
                                    <label className="form-label font-weight-bold">Remark :</label>
                                    <input type="text"
                                        className="form-control form-control-sm"
                                        id="remark"
                                        name="remark"
                                        maxLength={50}
                                        defaultValue={modal.modalData ? modal.modalData.remark : ""}
                                    />
                                </div>
                                {modal.modalData &&
                                    <div className="col-sm-12">
                                        <label className="form-label font-weight-bold">Status :<Astrick color="red" size="13px" /></label>
                                        <div className="row">
                                            <div className="col-md-2">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" name="is_active" id="is_active_1"
                                                        value="1"
                                                        defaultChecked={(modal.modalData && modal.modalData.is_active === 1) ? true : ((!modal.modalData) ? true : false)}
                                                    />
                                                    <label className="form-check-label" htmlFor="is_active_1">
                                                        Active
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-md-1">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" name="is_active" id="is_active_0" value="0"
                                                        readOnly={(modal.modalData) ? false : true}
                                                        defaultChecked={(modal.modalData && modal.modalData.is_active === 0) ? true : false}
                                                    />
                                                    <label className="form-check-label" htmlFor="is_active_0">
                                                        Deactive
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                }

                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        {!modal.modalData && <button type="submit" className="btn btn-primary text-white" style={{ backgroundColor: "#484C7F",width:'80px',padding:"8px" }}>
                            Add
                        </button>
                        }
                        {modal.modalData && checkRole && checkRole[8].can_update === 1 ? <button type="submit" className="btn btn-primary text-white" style={{ backgroundColor: "#484C7F" }}  >
                            Update
                        </button> : ""}
                        <button type="button" className="btn btn-danger text-white"
                            onClick={() => { handleModal({ showModal: false, modalData: "", modalHeader: "" }) }} >
                            Cancel
                        </button>
                    </Modal.Footer>
                </form>
            </Modal>

        </div>
    )
}

function DepartmentDropdown(props) {
    const [data, setData] = useState(null);
    useEffect(async () => {
        const tempData = [];
        await new DepartmentService().getDepartment().then(res => {
            if (res.status === 200) {
                const data = res.data.data;
                let counter = 1;
                for (const key in data) {
                    tempData.push({
                        counter: counter++,
                        id: data[key].id,
                        department: data[key].department
                    })
                }
                setData(tempData);
            }
        });
    }, [])

    return (
        <>
            {data &&
                <select className="form-control form-control-sm"
                    id={props.id}
                    name={props.name}
                    onChange={props.getChangeValue}
                    required={props.required ? true : false}
                >
                    {props.defaultValue == 0 && <option value='' selected>Select Department</option>}
                    {props.defaultValue != 0 && <option value=''>Select Department</option>}
                    {data.map(function (item, i) {
                        if (props.defaultValue && props.defaultValue == item.id) {
                            return <option key={i} value={item.id} selected>{item.department}</option>
                        } else {
                            return <option key={i} value={item.id}>{item.department}</option>
                        }

                    })
                    }
                </select>
            }
            {!data && <p> Loading....</p>}
        </>
    )
}
export { DepartmentComponent, DepartmentDropdown };
