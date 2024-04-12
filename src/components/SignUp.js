import { useRef, useState } from "react";
import { sendSmsVerification, checkVerification } from "../OTP_Verification/api";
import {btnStyle} from '../Data/btnStyle';
import './signUp.css';
function SignUp({toastToggler,loadingToggler,updatePageState})
{
    const [phone,setPhone]=useState('');
    const [userName,setUser]=useState('');
    const [password,setPassword]=useState('');
    const [OTP,setOTP]=useState('');
    const [phoneVerified,updateVerificationStatus]=useState(false);
    const [timer,setTimer]=useState(60);
    const [otpSent,setOTPStatus]=useState(false);
    const [q1,setq1]=useState('');
    const [q2,setq2]=useState('');
    const [q3,setq3]=useState('');
    const [q4,setq4]=useState('');
    const intervalID=useRef(false);
    const timerRef=useRef(60);

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
        if(phone==='')
            toastToggler('Phone number field can not be empty');
        else if(!/^\+\d+$/.test(phone))
            toastToggler('Phone number does not appeared to be valid');
        else
        {
            sendSmsVerification(phone)
            .then(res=>{
                setOTPStatus(true);
                toastToggler(res);
                startTimer();
            })
            .catch(e=>{
                toastToggler(e);
            });
        }
    }

    function phoneVerificationHandler()
    {
        if(OTP.length!==6)
        {
            toastToggler('OTP seems incorrect. It should contain 6 digits');
        }
        else if(!/^\d+$/.test(OTP))
        {
            toastToggler('OTP seems incorrect. It should only contain number');
        }
        else
        {
            checkVerification(phone,OTP,false).
            then(res=>{
                toastToggler(res.msg);
                updateVerificationStatus(true);
            }).
            catch(e=>{
                toastToggler(e.msg);
            });
        }
    }

    function signUpBtn()
    {
        let count=0;
        if(q1==='')
            ++count;
        if(q2==='')
            ++count;
        if(q3==='')
            ++count;
        if(q4==='')
            ++count;
        if(phone===''||userName===''||password==='')
            toastToggler('User Name and Password field can not be left blank');
        else if(!phoneVerified)
            toastToggler('Error! Phone number not verified');
        else if(count>1)
            toastToggler('You need to answer atleast any three personal questions');
        else
        {
            loadingToggler();
            let q=[{1:q1},{2:q2},{3:q3},{4:q4}];
            fetch(`${process.env.REACT_APP_SERVER_URL}/register/signUp`, 
            {
              method: "POST",
              mode:'cors',
              body: JSON.stringify({'userName':userName,'password':password,'phone':phone,'question':q.filter((val)=>{return(Object.values(val)[0]===''?false:true)})}),
              headers: {
              "Content-Type": "application/json"
              }
            }).then((res)=>{
                loadingToggler();
                if(res.status===200)
                {
                    toastToggler('Sign Up Successful!!');
                }
                else if(res.status===409)
                {
                    toastToggler('Sign Up Failed!! Username already exist');
                }
                else
                {
                    toastToggler('Sign Up Failed!!');
                }
            }).catch((err)=>{
                loadingToggler();
                toastToggler('Sign Up Failed!!');
            });
        }
        
    }

    return(
    <div id='contentContainer'>
        <div style={{fontSize:'3.2vmin',fontWeight:"500",marginBottom:'3vmin'}}>Enter the Sign Up details</div>
        <input className="signUpInputs" placeholder="Username" value={userName} onChange={(e)=>{setUser(e.target.value)}} />
        <input type='password' className="signUpInputs" placeholder="Password" value={password} onChange={(e)=>{setPassword(e.target.value)}} />
        <div style={{width:'83%',height:'fit-content',display:'flex',flexDirection:'column'}}>
            <div style={{width:'100%',height:'fit-content', display:'flex', alignItems:'center',marginBottom:'2vmin' }}>
                <input disabled={intervalID.current||phoneVerified} style={{width:'65%',margin:'0',height:'100%'}} className='signUpInputs' placeholder="Phone Number with Country code" value={phone} onChange={(e)=>{setPhone(e.target.value)}}/>
                <div style={{width:'5%',height:'fit-content'}}/>
                <button disabled={intervalID.current||phoneVerified} style={btnStyle} onClick={sendOTPHandler}>Send OTP</button>
            </div>
            {(intervalID.current&&!phoneVerified)&&<div style={{width:'100%',height:'fit-content', fontSize:'2.5vmin', display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',wordBreak:'break-word',paddingBottom:'2vmin'}}>
                you can resend OTP in {timer} sec
            </div>}
            {(!phoneVerified&&otpSent)&&<div style={{width:'100%',height:'fit-content', display:'flex', alignItems:'center',marginBottom:'2vmin' }}>
                <input style={{width:'65%',margin:'0',height:'100%', textAlign:'center'}} className='signUpInputs' placeholder="OTP" value={OTP} onChange={(e)=>{setOTP(e.target.value)}}/>
                <div style={{width:'5%',height:'fit-content'}}/>
                <button 
                style={btnStyle} onClick={phoneVerificationHandler}>Verify</button>
            </div>}
        </div>
        <div style={{fontSize:'3vmin',fontWeight:'500'}}>Personal Questions</div>
        <div className='ele1'>
            <div className='ele1txt'>1. What is your birth place?</div>
            <input value={q1} onChange={(e)=>{setq1(e.target.value)}}/>
        </div>
        <div className='ele1'>
            <div className='ele1txt'>2. What is your father's name?</div>
            <input value={q2} onChange={(e)=>{setq2(e.target.value)}}/>
        </div>
        <div className='ele1'>
            <div className='ele1txt'>3. What is your favourite movie?</div>
            <input value={q3} onChange={(e)=>{setq3(e.target.value)}}/>
        </div>
        <div className='ele1'>
            <div className='ele1txt'>4. What is your favourite food?</div>
            <input value={q4} onChange={(e)=>{setq4(e.target.value)}}/>
        </div>
        <button className="loginSignUpbtn" onClick={signUpBtn}>Sign Up</button>
        <div style={{fontSize:'2.5vmin',display:'flex'}}>Already have an Account? <div style={{cursor:'pointer',marginLeft:'0.2vmax', color:'#1e4c90'}} onClick={()=>{updatePageState(1)}}>Login</div></div>
    </div>
    );
}
export default SignUp;