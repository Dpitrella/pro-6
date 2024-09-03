const modal1 = document.getElementById('modal1');
const modal2 = document.getElementById('modal2');
const modalContent = document.getElementById('modalContent');
const ajouterButton = document.getElementById('ajouter-button');
const fileInput = document.getElementById('file-input');
const ajouterDiv = document.getElementById('ajouter');
const gallery = document.querySelector('.gallery');

const getWork = () => fetch("http://localhost:5678/api/works").then(res => res.json());
const redirectToLogin = () => window.location.href = 'login.html';
const authToken = () => localStorage.getItem("authToken");

//*** Bloquer l'accès s'il n'y a pas de token ***//

document.addEventListener('DOMContentLoaded', async () => {
    const referrer = document.referrer;

    if (!authToken() || !referrer.includes('login.html')) {
        redirectToLogin()
        return;
    }

    //*** Validation du formulaire ***//

    const works = await getWork();
    displayWorks(works, 'all');
    const inputs = ['title', 'category', 'file-input'].map(id => document.getElementById(id)),
    validerButton = document.getElementById('myForm'),

    checkFormCompletion = () => {
    const allFilled = inputs[0].value.trim() && inputs[1].value && inputs[2].files.length;
    validerButton.style.backgroundColor = allFilled ? '#1D6154' : '';
    validerButton.disabled = !allFilled;
    
};
inputs.forEach(input => input.addEventListener('input', checkFormCompletion));
inputs[1].addEventListener('change', checkFormCompletion);
validerButton.disabled = true;

});

const displayWorks = (works, filterId = 'all') => {
    gallery.innerHTML = works.filter(work => filterId === 'all' || work.categoryId == filterId)
        .map(work => `<div class="work-item"><img src="${work.imageUrl}" alt="${work.title}" width="200"><h3>${work.title}</h3></div>`)
        .join('');
};
//*** supprimer les travaux ***//

const deleteWork = (id) => fetch(`http://localhost:5678/api/works/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${authToken()}` }
}).then(res => res.ok ? document.querySelector(`.gallery [data-id="${id}"]`)?.remove() : console.error('Erreur lors de la suppression:', res.statusText));

const loadModalContent = async () => {
    const works = await getWork();
    
    modalContent.innerHTML = works.map(work => `
        <div class="work-" style="position: relative;">
            <img src="${work.imageUrl}" alt="${work.title}" width="100">
            <button class="delete-button" data-id="${work.id}" style="position: absolute; top: 5px; right: 5px; background: transparent; border: none; cursor: pointer;">
                <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
            </button>
        </div>
    `).join('');
    modalContent.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', async () => {
            await deleteWork(button.dataset.id);
            loadModalContent();
        });
    });
};

const toggleModal = (open, modal) => {
    modal.style.display = open ? 'block' : 'none';
    document.body.style.overflow = open ? 'hidden' : 'auto';
};

//*** Événements pour ouvrir fermer les modal ***//
document.querySelectorAll('#btn-modale').forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    toggleModal(true, modal1);
    loadModalContent()
}));
document.querySelector('.close-modal').addEventListener('click', () => toggleModal(false, modal1));
document.querySelector('.close-modal-2').addEventListener('click', () => toggleModal(false, modal2));
modal1.addEventListener('click', e => {
    if (e.target === modal1 || !e.target.closest('.modal-wrapper')) toggleModal(false, modal1);
});
modal2.addEventListener('click', e => {
    if (e.target === modal2 || !e.target.closest('.modal-wrapper-2')) toggleModal(false, modal2);
});
document.getElementById('add-photo-btn').addEventListener('click', () => {
    toggleModal(false, modal1);
    toggleModal(true, modal2);
});
document.getElementById('goBack').addEventListener('click', () => {
    toggleModal(true, modal1);
    toggleModal(false, modal2);
});



//*** Evénement pour charger l'image sélectionnée ***//
ajouterButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => ajouterDiv.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 100%;"/>`;
        reader.readAsDataURL(file);
    }
});


//*** formulaire ***//

//*** charger les catégories depuis l'API ***//

const loadCategories = async () => {
    try {
        const response = await fetch('http://localhost:5678/api/categories');
        const categories = await response.json(); 
        const categorySelect = document.getElementById('category'); 

        categorySelect.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        
        categorySelect.appendChild(defaultOption);

        //*** ajout categories comme options ***//
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name; 
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur de chargement des catégories :', error);
    }
};
    loadCategories(); 

//*** Logique du formulaire ***//
document.getElementById('myForm').addEventListener('click', async (event) => {
    event.preventDefault()

    const formData = new FormData();
    formData.append('title', document.querySelector('#title').value);
    formData.append('category', document.querySelector('#category').value);

    if (fileInput.files.length > 0) {
        formData.append('image', fileInput.files[0]);
    } 
    fetch('http://localhost:5678/api/works', {
        headers: { "authorization": `Bearer ${authToken()}` },
        method: 'POST',
        body: formData,
    });
});




