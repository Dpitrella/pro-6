
document.getElementById("logForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.ok ? response.json() : response.json().then(data => { throw new Error(data.message || "Identification non valide"); }))
    .then(data => {
        localStorage.setItem("authToken", data.token);
        window.location.href = '../FrontEnd/modif.html';
    })
    .catch(error => {
        console.error("Erreur lors de la requête:", error.message);
        const errorMessageElement = document.getElementById("error-message");
        errorMessageElement.innerText = error.message || "Identification non valide, réessayez";
        errorMessageElement.style.display = 'block';
    });
})
