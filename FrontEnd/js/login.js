document.getElementById("logForm").addEventListener("submit", function(event) {
    event.preventDefault(); 

    ///// Capturer les données du formulaire ////

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    ////// URL de l'API d'authentification ///////
    const apiUrl = "http://localhost:5678/api/users/login";

    ////// Envoie des données à l'API à l'aide d'une requête POST //////
    fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ email: email, password: password }) 
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || "Identification non valide");
            });
        }
        return response.json(); 
    })
    .then(data => {
        console.log("Problème d'identification", data);
        
        //// Enregistrer le token dans localStorage ///
        localStorage.setItem("authToken", data.token);

       //// rediriger l'utilisateur vers une autre page /////
        window.location.href ='../FrontEnd/modif.html '
    })
    .catch(error => {
        console.error("Error en la solicitud:", error.message);
        document.getElementById("error-message").innerText = error.message || "Identification non valide, réessayez";
    });
});
