import loadingImage from '../resources/loading.gif';
function Loading({msg})
{
    return(<div id='loading' style={{
        position:'fixed',
        top:0,
        left:0,
        width:'100vw',
        height:'100vh',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'column',
        fontSize:'2vmin',
        backgroundColor:'rgba(0,0,0,0.7)',
        zIndex:'1'
        }}>
        <img src={loadingImage} alt='Loading...'/>
    </div>);
}

export default Loading;