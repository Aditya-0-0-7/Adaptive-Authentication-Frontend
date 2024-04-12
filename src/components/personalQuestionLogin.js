import { useEffect, useState, memo } from 'react';
import {question} from '../Data/questionData';

function PersonalQuestionLogin({toastToggler,loadingToggler,updatePageState,userName,modelData})
{
    const [answer,setAnswers]=useState({'1':'','2':'','3':'','4':''});
    const [questionID,setQuestionID]=useState([]);

    useEffect(()=>{
        if(questionID.length===0)
        {
            loadingToggler();
            fetch(`${process.env.REACT_APP_SERVER_URL}/helper/questionID`,
            {
                method: "POST",
                mode:'cors',
                body: JSON.stringify({'userName':userName}),
                headers: {
                "Content-Type": "application/json"
                }
            }).then((response)=>{
                if(response.status===200)
                {
                    response.json().then(question=>{
                        setQuestionID(question.QuestionID);
                    });
                }
                else
                {
                    toastToggler('Error in Fetching the question for Question Login Method');
                }
                loadingToggler();
            }).catch(error=>{
                toastToggler('Error in Fetching the question for Question Login Method');
                loadingToggler();
            });
        }
    },[]);

    function answerHandler(e)
    {
        setAnswers(ans=>{
            const tempAns={...ans};
            tempAns[`${e.target.id}`]=e.target.value;
            return tempAns;
        });
    }

    function questionLoginHandler()
    {
        loadingToggler();
        fetch(`${process.env.REACT_APP_SERVER_URL}/login/QuestionLogin`, 
        {
          method: "POST",
          mode:'cors',
          body: JSON.stringify({'answer':answer,'modelData':modelData,'userName':userName}),
          headers: {
          "Content-Type": "application/json"
          }
        })
        .then(response=>{
            if(response.status===200)
            {
                response.json().then(parseResponse=>{
                    localStorage.setItem('token', parseResponse.token);
                    updatePageState(5);
                    loadingToggler();
                    toastToggler('Authentication Successful');
                })
            }
            else if(response.status===401)
            {
                loadingToggler();
                toastToggler('Error! The answers provided by you are wrong');
            }
            else if(response.status===503)
            {
                loadingToggler();
                toastToggler('Error! Database error occured try again');
            }
            else
            {
                loadingToggler();
                toastToggler('Error! Server error occured try again');
            }
        })
        .catch(error=>{
            loadingToggler();
            toastToggler('Error! can not fulfill your request this time please try again');
        });
    }

    return(
    <div id='contentContainer'>
        <div style={{fontSize:'3vmin',fontWeight:'500', textAlign:'center',wordBreak:'break-word',width:'100%'}}>Please Answer these Questions</div>
        {questionID.map(qID=>{
            return(
            <div id={qID} key={qID} className='ele1'>
                <div className='ele1txt'>{question[qID-1]}</div>
                <input id={qID} value={answer[`${qID}`]} onChange={answerHandler}/>
            </div>
            );
        })}
        <button className="loginSignUpbtn" onClick={questionLoginHandler}>Login</button>
    </div>
    );
}
export default memo(PersonalQuestionLogin);