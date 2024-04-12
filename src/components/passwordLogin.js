import { memo, useState } from "react";
import platform, { parse } from "platform";

function PasswordLogin({toastToggler,loadingToggler,updatePageState,setModelData,setUserName})
{
    const [userName,setUser]=useState('');
    const [loginPassword,setLoginPassword]=useState('');
    
    function getModelData()
    {
        return new Promise((resolve,reject)=>{
            //getting login time
            const currentDate=new Date();
            const loginTime=currentDate.toLocaleString();

            //getting user operating system
            const operatingSystem = platform.os.family;

            //getting user browser
            const browser = platform.name;

            //getting user location
            navigator.geolocation.getCurrentPosition(function(position) {
                const { latitude, longitude } = position.coords;
                fetch(`https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&lang=en-US&apiKey=${process.env.REACT_APP_GEO_API}`)
                .then(response => {
                    response.json()
                    .then(data=>{
                        resolve({
                            'loginTime':loginTime,
                            'userLocation':data.items[0].address.label,
                            'operatingSystem':operatingSystem,
                            'browser':browser
                            });
                    })
                    .catch(error=>{
                        reject(null);
                    });
                })
                .catch(error=>{
                    reject(null);
                });
            }, 
            function(error) {
                reject(null);
            });
        });
    }

    async function passwordLoginHandler()
    {
        loadingToggler();
        const modelData = await getModelData();
        setModelData(modelData);
        fetch(`${process.env.REACT_APP_SERVER_URL}/login/passwordLogin`, 
        {
          method: "POST",
          mode:'cors',
          body: JSON.stringify({'userName':userName,'password':loginPassword,'modelData':modelData}),
          headers: {
          "Content-Type": "application/json"
          }
        })
        .then(response=>{
            if(response.status===200)
            {
                response.json()
                .then(parseResponse=>{
                    setUserName(userName);
                    if(parseResponse.AuthenticationStatus===1)
                    {
                        localStorage.setItem('token', parseResponse.token);
                        updatePageState(5);
                    }
                    else if(parseResponse.AuthenticationStatus===2)
                    {
                        updatePageState(3);
                    }
                    else if(parseResponse.AuthenticationStatus===3)
                    {
                        updatePageState(4);
                    }
                    toastToggler('Authentication Successful');
                    loadingToggler();
                })
                .catch(error=>{
                    console.log(error);
                    toastToggler('Error! can not fulfill your request this time please try again');
                    loadingToggler();
                });
            }
            else if(response.status===404)
            {
                toastToggler('Error! Authentication failed User Name is incorrect');
                loadingToggler();
            }
            else if(response.status===401)
            {
                toastToggler('Error! Authentication failed wrong password');
                loadingToggler();
            }
            else if(response.status===503)
            {
                toastToggler('Error! Authentication failed Database error');
                loadingToggler();
            }
            else
            {
                toastToggler('Error! Authentication failed Server Error');
                loadingToggler();
            }
        })
        .catch(error=>{
            toastToggler('Error! can not fulfill your request this time please try again');
            loadingToggler();
        });
    }

    return(
        <div id='contentContainer'>
            <div style={{fontSize:'3.2vmin',fontWeight:"500",marginBottom:'2vmin'}}>Login to your account</div>
            <div className='ele1'>
                <div className='ele1txt'>Username</div>
                <input value={userName} onChange={e=>{setUser(e.target.value)}} placeholder="Username" />
            </div>
            <div className='ele1'>
                <div className='ele1txt'>Password</div>
                <input type='password' value={loginPassword} onChange={e=>{setLoginPassword(e.target.value)}} placeholder="Password" />
            </div>
            <button className="loginSignUpbtn" onClick={passwordLoginHandler}>Login</button>
            <div style={{fontSize:'2.5vmin',display:'flex'}}>New to MyApp? <div style={{cursor:'pointer',marginLeft:'0.2vmax', color:'#1e4c90'}} onClick={()=>{updatePageState(2)}}>Sign Up</div></div>
        </div>
    );
}
export default memo(PasswordLogin);