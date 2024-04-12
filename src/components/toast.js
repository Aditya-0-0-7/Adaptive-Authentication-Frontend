function Toast({msg})
{
    return(<div id='toast' style={{
        position:'fixed',
        padding:'1.5vmin',
        bottom:'5vh',
        right:'5vw',
        backgroundColor:'#D71313',
        color:'white',
        borderRadius:'5px',
        wordBreak:'break-word',
        minWidth:'10vmin',
        textAlign:'center'
        }}>
        {msg}
    </div>);
}
export default Toast;