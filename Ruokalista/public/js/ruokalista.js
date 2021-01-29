let date = ()=>{


    fetch("../lista.json", {mode: 'cors'}).then((response) =>{
        if (response.ok){
            return response.json()
        }else{
            throw new Error("Response error");
        }
    }).then((jsonFile) =>{
        console.log(jsonFile);
        console.log(jsonFile.courses);
        let lista = document.querySelector("#lista");
        lista.innerHTML='';
        for(let i=0; i<jsonFile.courses.length; i++){
            const ruoka = jsonFile.courses[i].title_fi;
            const ruoka2 = jsonFile.courses[i].title_en;
            console.log(ruoka);
            const hinta = jsonFile.courses[i].price;
            const tiedot = jsonFile.courses[i].properties;

            const nu = document.createElement("p");
            const li = document.createElement("p");
            nu.setAttribute('class','nu');
            li.setAttribute('class','li');
            lista.appendChild(nu);
            lista.appendChild(li);
            li.innerHTML = ruoka + "</br>" + ruoka2 + "</br>" + " Hinta/Price: " + hinta + " " + tiedot ;




        }

    }).catch((e) =>{
        console.log("Error " + e.message);
    })
    ;
};

date();
let hours = () => {
    let d = new Date();
    let hour = d.getHours();
    console.log(hour);
    if(hours===0){
        date();
    }else{
        console.clear();
        console.log(hour);
    }
};



setInterval(hours, 1800000);
