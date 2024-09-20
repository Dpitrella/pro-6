// =============================
// Variables et constantes
// =============================
const modal1 = document.getElementById('modal1');
const modal2 = document.getElementById('modal2');
const modalContent = document.getElementById('modalContent');
const ajouterButton = document.getElementById('ajouter-button');
const fileInput = document.getElementById('file-input');
const ajouterDiv = document.getElementById('ajouter');
const gallery = document.querySelector('.gallery');

// =============================
// Fonctions auxiliaires
// =============================
const getWork = () => fetch("http://localhost:5678/api/works").then(res => res.json());
const redirectToLogin = () => window.location.href = 'login.html';
const authToken = () => localStorage.getItem("authToken");

const toggleModal = (open, modal) => {
    modal.style.display = open ? 'block' : 'none';
    document.body.style.overflow = open ? 'hidden' : 'auto';
};

const resetForm = () => {
    document.getElementById('title').value = '';
    document.getElementById('category').value = '';
    const imgElement = ajouterDiv.querySelector("img");  // Sélectionne l'élément <img> à l'intérieur de la div
if (imgElement) {
    imgElement.src = "";  // Vide la source de l'image
    ajouterDiv.innerHTML = `<i class="fa-regular fa-image"></i>
							<label for="file-input"  id="ajouter-button" >+ Ajouter photo</label>
							<input type="file" id="file-input" style="display: none;" accept="image/*" >
							<p>jpg, png : 4mo max</p>
								`						
		
}
}

const deleteWork = async (id) => {
    return fetch(`http://localhost:5678/api/works/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken()}` }
    }).then(res => {
        if (res.ok) {
            document.querySelector(`.gallery [data-id="${id}"]`)?.remove();
        } else {
            console.error('Erreur lors de la suppression:', res.statusText);
        }
    });
};

const loadCategories = async () => {
    try {
        const response = await fetch('http://localhost:5678/api/categories');
        const categories = await response.json();
        const categorySelect = document.getElementById('category');

        
        categorySelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        categorySelect.appendChild(defaultOption);

       // Ajouter des catégories comme options
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

// =============================
// Fonctions de rendu
// =============================
const displayWorks = (works, filterId = 'all') => {
    gallery.innerHTML = works.filter(work => filterId === 'all' || work.categoryId == filterId)
        .map(work => `
            <div class="work-item" data-id="${work.id}">
                <img src="${work.imageUrl}" alt="${work.title}" width="200">
                <h3>${work.title}</h3>
            </div>
        `).join('');
};

const loadModalContent = async () => {
    const works = await getWork();
    modalContent.innerHTML = works.map(work => `
        <div class="work-item" style="position: relative;">
            <img src="${work.imageUrl}" alt="${work.title}" width="100">
            <button class="delete-button" data-id="${work.id}" style="position: absolute; top: 5px; right: 5px; background: transparent; border: none; cursor: pointer;">
                <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
            </button>
        </div>
    `).join('');

    // événement éliminer
    modalContent.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', async () => {
            await deleteWork(button.dataset.id);
            loadModalContent(); 
        });
    });
};

// =============================
// Validation du formulaire
// =============================
const validateForm = () => {
    const inputs = ['title', 'category', 'file-input'].map(id => document.getElementById(id));
    const validerButton = document.getElementById('myForm');

    const checkFormCompletion = () => {
        const allFilled = inputs[0].value.trim() && inputs[1].value && inputs[2].files.length;
        validerButton.style.backgroundColor = allFilled ? '#1D6154' : '';
        validerButton.disabled = !allFilled;
    };

   
    inputs.forEach(input => input.addEventListener('input', checkFormCompletion));
    inputs[1].addEventListener('change', checkFormCompletion);
    validerButton.disabled = true;
};

// =============================
// DOM events
// =============================
document.addEventListener('DOMContentLoaded', async () => {
    
    if (!authToken()) {
        redirectToLogin();
        return;
    }

    
    const works = await getWork();
    displayWorks(works, 'all');
    validateForm();
    loadCategories();
});


document.querySelectorAll('#btn-modale').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleModal(true, modal1);
        loadModalContent();
    });
});

document.querySelector('.close-modal').addEventListener('click', () => toggleModal(false, modal1));
document.querySelector('.close-modal-2').addEventListener('click', () => toggleModal(false, modal2));
modal1.addEventListener('click', (e) => {
    if (e.target === modal1 || !e.target.closest('.modal-wrapper')) toggleModal(false, modal1);
});
modal2.addEventListener('click', (e) => {
    if (e.target === modal2 || !e.target.closest('.modal-wrapper-2')) toggleModal(false, modal2);
});
document.getElementById('add-photo-btn').addEventListener('click', () => {
    toggleModal(false, modal1);
    toggleModal(true, modal2);
    resetForm();
});
document.getElementById('goBack').addEventListener('click', () => {
    toggleModal(true, modal1);
    toggleModal(false, modal2);
});
// Evénement pour charger l'image sélectionnée
//ajouterButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            ajouterDiv.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 100%;"/>`;
        };
        reader.readAsDataURL(file);
    }
});

// =============================
// Logique du formulaire
// =============================
document.getElementById('myForm').addEventListener('click', async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', document.querySelector('#title').value);
    formData.append('category', document.querySelector('#category').value);

    if (fileInput.files.length > 0) {
        formData.append('image', fileInput.files[0]);
    }

    try {
        const response = await fetch('http://localhost:5678/api/works', {
            headers: { "Authorization": `Bearer ${authToken()}` },
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const works = await getWork();
            displayWorks(works, 'all');
            loadModalContent();
            resetForm()
            toggleModal(false, modal2);
        } else {
            console.error('Erreur lors de lenvoi du formulaire :', response.statusText);
        }
    } catch (error) {
        console.error('Erreur lors de lenvoi du formulaire :', error);
    }
});
