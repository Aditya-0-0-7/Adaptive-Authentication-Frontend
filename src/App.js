import './App.css';
import PasswordLogin from './components/passwordLogin';
import Toast from './components/toast';
import Loading from './components/loading';
import SignUp from './components/SignUp';
import PersonalQuestionLogin from './components/personalQuestionLogin';
import OTPLogin from './components/otpLogin';
import Authenticated from './components/Authenticated';
import {useCallback, useEffect, useState} from 'react';
function App() {
  const [pageState,updatePageState]=useState(0);
  const [toastVisibility,toggleToast]=useState(false);
  const [toastMessage,setToastMsg]=useState('');
  const [isLoading,setLoading]=useState(false);
  const [modelData,setModelData]=useState([]);
  const [userNames,setUserName]=useState('');

  const toastToggler=useCallback((msg)=>
  {
    toggleToast(true);
    setToastMsg(msg);
    setTimeout(()=>{
      toggleToast(false);
    },3000);
  },[toggleToast,setToastMsg]);

  const loadingToggler=useCallback(()=>
  {
    setLoading(val=>!val);
  },[setLoading]);

  const setPageState=useCallback((page)=>{
    updatePageState(page);
  },[updatePageState]);

  useEffect(()=>{
    const storedToken = localStorage.getItem('token');
    if(storedToken)
    {
      loadingToggler();
      fetch(`${process.env.REACT_APP_SERVER_URL}/helper/isAuthenticated`, 
        {
          method: "POST",
          mode:'cors',
          body: JSON.stringify({'token':storedToken}),
          headers: {
          "Content-Type": "application/json"
          }
        })
        .then(response=>{
          if(response.status===200)
          {
            setPageState(5);
          }
          else if(response.status===403)
          {
            setPageState(1);
          }
          else
          {
            toastToggler('Some Error occured loading the application refresh page and try again');
          }
          loadingToggler();
        })
        .catch(error=>{
          loadingToggler();
          toastToggler('Some Error occured loading the application refresh page and try again');
        });
    }
    else
    {
      setPageState(1);
    }
  },[]);

  return (
    <div id='mainScreen'>
      {isLoading&&<Loading/>}
      <div id='imageHolder'/>
      <video className="video" autoPlay muted loop>
      <source
        className="lazy lazy-hidden"
        src="https://hashedin.com/wp-content/uploads/2023/08/Motif_480p.mp4"
        type="video/mp4"
      />
    </video>
      <div id='contentHolder'>
        <div id='contentSubHolder'>
          {toastVisibility&&<Toast msg={toastMessage}/>}
          {pageState===1&&
            <PasswordLogin toastToggler={toastToggler} loadingToggler={loadingToggler} updatePageState={setPageState} setModelData={setModelData} setUserName={setUserName} />
          }
          {pageState===2&&
            <SignUp toastToggler={toastToggler} loadingToggler={loadingToggler} updatePageState={setPageState}/>
          }
          {pageState===3&&
            <PersonalQuestionLogin toastToggler={toastToggler} loadingToggler={loadingToggler} updatePageState={setPageState} userName={userNames} modelData={modelData}/>
          }
          {pageState===4&&
            <OTPLogin toastToggler={toastToggler} loadingToggler={loadingToggler} updatePageState={setPageState} userName={userNames} modelData={modelData} />
          }
          {pageState===5&&
            <Authenticated toastToggler={toastToggler} loadingToggler={loadingToggler} updatePageState={setPageState}/>
          }
        </div>
      </div>
    </div>
  );
}

export default App;
