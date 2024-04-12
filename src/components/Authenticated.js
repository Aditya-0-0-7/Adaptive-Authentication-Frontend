import Success from '../resources/Success3.gif';
import { btnStyle } from '../Data/btnStyle';
function Authenticated({toastToggler,loadingToggler,updatePageState})
{

    function logoutHandler()
    {
        try
        {
            localStorage.removeItem('token');
            toastToggler('Logout Successful');
            updatePageState(1);
        }
        catch(error)
        {
            toastToggler('Logout Failed! Retry Again');
        }
    }

    return(
    <div id="contentContainer">
        <img style={{width:'80%', height:'80%'}} src={Success}/>
        <div style={{fontSize:'3vmin', textAlign:'center', wordBreak:'break-word', fontWeight:'500',marginBottom:'3vmin'}}>You have been authenticated Successfully</div>
        <button style={btnStyle} onClick={logoutHandler}>Logout</button>
    </div>
    );
}
export default Authenticated;