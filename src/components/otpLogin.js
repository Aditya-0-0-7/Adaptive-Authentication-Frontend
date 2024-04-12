import { useEffect, useRef, useState } from "react";
import {btnStyle} from '../Data/btnStyle';
import { sendSmsVerification, checkVerification } from '../OTP_Verification/api';

function OTPLogin({toastToggler,loadingToggler,updatePageState,userName,modelData})
{
    const intervalID=useRef(false);
    const timerRef=useRef(60);
    const [timer,setTimer]=useState(60);
    const [sentOTP,setOTPStatus]=useState(false);
    const [phone,setPhone]=useState('');
    const [otp,setOTP]=useState('');

    useEffect(()=>{
        if(phone==='')
        {
            loadingToggler();
            fetch(`${process.env.REACT_APP_SERVER_URL}/helper/phone`,
            {
                method: "POST",
                mode:'cors',
                body: JSON.stringify({userName:userName}),
                headers: {
                "Content-Type": "application/json"
                }
            }).then(response=>{
                if(response.status===200)
                {
                    response.json().then(parseRes=>{
                        loadingToggler();
                        setPhone(parseRes.phone);
                    })
                }
                else
                {
                    loadingToggler();
                    toastToggler('Error! Some error occured fetching user phone number please refresh page and retry authentication again');
                }
            }).catch(error=>{
                loadingToggler();
                toastToggler('Error! Some error occured fetching user phone number please refresh page and retry authentication again');
            });
        }
    },[]);

    function startTimer()
    {
        intervalID.current=setInterval(()=>{
            setTimer(val=>val-1);
            timerRef.current=timerRef.current-1;
            if(timerRef.current<1)
            {
                clearInterval(intervalID.current);
                intervalID.current=false;
                setTimer(60);
                timerRef.current=60;
            }
        },1000);
    }

    function sendOTPHandler()
    {
        loadingToggler();
        sendSmsVerification(phone)
        .then((res)=>{
            loadingToggler();
            startTimer();
            toastToggler(res);
            setOTPStatus(true);
        })
        .catch(error=>{
            loadingToggler();
            toastToggler(error);
        });
    }

    function verifyOTPHandler()
    {
        loadingToggler();
        checkVerification(phone,otp,true,userName,modelData)
        .then(response=>{
            toastToggler(response.msg);
            localStorage.setItem('token', response.token);
            loadingToggler();
            updatePageState(5);
        })
        .catch(error=>{
            toastToggler(error.msg);
            loadingToggler();
        });
    }

    return(
    <div id='contentContainer' style={{textAlign:'center', wordBreak:'break-word'}}>
        <div style={{fontSize:'2.5vmin', fontWeight:'500',marginBottom:'2vmin'}}>You need to verify your identity using OTP click on below button to trigger OTP to your registered phone number</div>
        <button style={btnStyle} disabled={intervalID.current} onClick={sendOTPHandler}>Send OTP</button>
        {intervalID.current&&<div>You can resend OTP in {timer} Seconds</div>}
        {sentOTP&&
        <div style={{width:'100%',height:'fit-content', display:'flex', alignItems:'center',marginBottom:'2vmin', marginTop:'3vmin', flexDirection:'column' }}>
            <input style={{width:'80%',marginBottom:'2vmin',height:'100%', textAlign:'center'}} placeholder="OTP" value={otp} onChange={(e)=>{setOTP(e.target.value)}}/>
            <button style={{...btnStyle,backgroundColor:'#65B741'}} onClick={verifyOTPHandler}>Verify OTP</button>
        </div>}
    </div>);
}
export default OTPLogin;