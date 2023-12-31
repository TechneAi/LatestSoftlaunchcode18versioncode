import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom';
import CustomerMappingService from '../../../services/SettingService/CustomerMappingService'
import DataTable from "react-data-table-component";
import ErrorLogService from "../../../services/ErrorLogService";
import PageHeader from "../../../components/Common/PageHeader";
import Alert from "../../../components/Common/Alert";
import Select from 'react-select';
import { _base } from '../../../settings/constants'
import { ExportToExcel } from '../../../components/Utilities/Table/ExportToExcel'
import ManageMenuService from '../../../services/MenuManagementService/ManageMenuService'
import { Spinner } from 'react-bootstrap';
import { Modal } from "react-bootstrap";

export default function CustomerMappingComponent({ location }) {

  const [notify, setNotify] = useState(null);
  const [data, setData] = useState(null);
  const [dataa, setDataa] = useState(null);

  const [exportData, setExportData] = useState(null)
  const [showLoaderModal, setShowLoaderModal] = useState(false);

  const roleId = sessionStorage.getItem("role_id")
  const [checkRole, setCheckRole] = useState(null)


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
          <Link to={`/${_base}/CustomerMapping/Edit/` + row.id}
            className="btn btn-outline-secondary">
            <i className="icofont-edit text-success"></i>
          </Link>
        </div>
    },
    { name: 'Sr.No', selector: row => row.counter, sortable: true,width: "60px", },
    { name: 'Query', selector: row => row.query_type_name, sortable: true,width: "175px" },
    { name: 'Template', selector: row => row.template_name, sortable: true,width: "175px" },
    { name: 'Form', selector: row => row.dynamic_form_name, sortable: true, width: "175px"},

    { name: 'Department', selector: row => row.department_name, sortable: true,width: "175px" },
    { name: 'Priority', selector: row => row.priority, sortable: true, },
    { name: 'Approach', selector: row => row.approach, sortable: true,width: "175px" },
    {
      name: 'Status',
      selector: (row) => row.is_active,
      sortable: true,
      cell: (row) => (
        <div>
          {row.is_active === 1 && (
            <span className="badge bg-primary" style={{width:"4rem"}}>Active</span>
          )}
          {row.is_active === 0 && (
            <span className="badge bg-danger" style={{width:"4rem"}}>Deactive</span>
          )}
        </div>
      ),
    },
    { name: 'Created At', selector: (row) => row.created_at, sortable: true, width: "175px" },
    { name: 'Created By', selector: (row) => row.created_by, sortable: true, width: "175px" },
    { name: 'Updated At', selector: (row) => row.updated_at, sortable: true, width: "175px" },
    { name: 'Updated By', selector: (row) => row.updated_by, sortable: true, width: "175px" },
  ];
  const makeActive = id => {
    // e.preventDefault();
    const data = new FormData();
    data.append('is_default', 1);
    // for (var pair of data.entries()) {
    //   console.log(pair[0]+ ', ' + pair[1]); 
    // }
    new CustomerMappingService().updateCustomerMapping(id, data).then(res => {
      if (res.status === 200) {
        if (res.data.status == 1) {
          loadData();
        }
      }
    });
  }
  const loadData = async () => {
    setShowLoaderModal(null);
    setShowLoaderModal(true);
    const tempData = [];
    const exportTempData = [];
    await new CustomerMappingService().getCustomerMapping().then(res => {
      if (res.status === 200) {
        setShowLoaderModal(false);

        let counter = 1;
        const data = res.data.data;
        for (const key in data) {
          tempData.push({
            counter: counter++,
            id: data[key].id,
            query_type_name: data[key].query_type_name,
            template_name: data[key].template_name,
            dynamic_form_name: data[key].dynamic_form_name,
            project_name: data[key].project_name,
            module_name: data[key].module_name,
            sub_module_name: data[key].sub_module_name,
            department_name: data[key].department_name,
            priority: data[key].priority,
            approach: data[key].approach,
            is_default: data[key].is_default,
            is_active: data[key].is_active,
            created_at: data[key].created_at,
            created_by: data[key].created_by,
            updated_at: data[key].updated_at,
            updated_by: data[key].updated_by,
          })
        }
        setData(tempData);
        setDataa(tempData);

        for (const i in data) {
          exportTempData.push({
            Sr: counter++,
            Query: data[i].query_type_name,
            Template: data[i].template_name,
            Department: data[i].department_name,
            Priority: data[i].priority,
            Approach: data[i].approach,
          })
        }

        setExportData(null)
        setExportData(exportTempData)
      }
    });

    await new ManageMenuService().getRole(roleId).then((res) => {
      if (res.status === 200) {
        setShowLoaderModal(false);
        if (res.data.status == 1) {
          setCheckRole(res.data.data.filter(d => d.role_id == roleId))
        }
      }
    })
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  };


  useEffect(() => {
    loadData();
    if (location && location.state) {
      setNotify(location.state.alert);
    }
  }, [])

  useEffect(()=>{
    if(checkRole && checkRole[31].can_read === 0){
      window.location.href = `${process.env.PUBLIC_URL}/Dashboard`;  
    }
  },[checkRole])

  return (
    <div className="container-xxl">
      {notify && <Alert alertData={notify} />}

      <PageHeader headerTitle="Customer Mapping" renderRight={() => {
        return <div className="col-auto d-flex w-sm-100">
          {checkRole && checkRole[31].can_create === 1 ?
            <Link to={`/${_base}/CustomerMapping/Create`} className="btn btn-dark btn-set-task w-sm-100">
              <i className="icofont-plus-circle me-2 fs-6"></i>Create Mapping Setting
            </Link> : ""}
        </div>
      }} />

      <div className="card card-body">
        <div className="row">
          <div className="col-md-9">
            <input
              type="text"
              className="form-control"
              placeholder="Search...."
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
              fileName="Customer Mapping master Records"
            />
          </div>
        </div>
      </div>
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

      <Modal show={showLoaderModal} centered>
                <Modal.Body className="text-center">
                    <Spinner animation="grow" variant="primary" />
                    <Spinner animation="grow" variant="secondary" />
                    <Spinner animation="grow" variant="success" />
                    <Spinner animation="grow" variant="danger" />
                    <Spinner animation="grow" variant="warning" />
                    <Spinner animation="grow" variant="info" />
                    <Spinner animation="grow" variant="dark" />
                </Modal.Body>
            </Modal>
    </div>
  )
}