const modal1 = document.getElementById('modal1');
const modal2 = document.getElementById('modal2');
const modalContent = document.getElementById('modalContent');
const authToken = localStorage.getItem("authToken");
const ajouterButton = document.getElementById('ajouter-button');
const fileInput = document.getElementById('file-input');
const ajouterDiv = document.getElementById('ajouter');
const gallery = document.querySelector('.gallery'); 


async function loadCategory() {
    fetch('http://localhost:5678/api/categories')
    .then(response => {
        return response.json();
    })
    .then(category => {
        const selectCategory = document.getElementById('category');


        selectCategory.innerHTML = '<option value=""></option>';

        category.forEach(categories => {
            const option = document.createElement('option');
            option.value = categories.id;
            option.textContent = categories.name;
            selectCategory.appendChild(option);
        });
    });
}
document.addEventListener('DOMContentLoaded', loadCategory);

async function getWork() {
    let response = await fetch("http://localhost:5678/api/works");
    let data = await response.json();
    return data;
}


function displayWorks(works, filterId = 'all') {
    gallery.innerHTML = ''; 
    const fragment = document.createDocumentFragment();

    const filteredWorks = filterId === 'all'
        ? works
        : works.filter(work => work.categoryId == filterId); 

    filteredWorks.forEach(work => {
        const workItem = document.createElement('div');
        workItem.classList.add('work-item');
        workItem.innerHTML = `
            <img src="${work.imageUrl}" alt="${work.title}" width="200">
            <h3>${work.title}</h3>
        `;
        fragment.appendChild(workItem);
    });

   gallery.appendChild(fragment);
}



async function fetchWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    return response.ok ? response.json() : console.error("Erreur lors de l'obtention des travaux :", response.statusText);
}

async function deleteWork(id) {
    if (!authToken) return console.error("Aucun token d'authentification trouvé.");
    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (response.ok) {
        document.querySelector(`.gallery [data-id="${id}"]`)?.remove();
        console.log(`Travail avec supprimé.`);
    } else {
        console.error(`Erreur lors de la suppression : ${response.statusText}`);
    }
}

async function loadModalContent() {
    const works = await fetchWorks();
    if (works) {
        modalContent.innerHTML = works.map(work => `
            <div class="work-item" style="position: relative;">
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
    }
}

function toggleModal(open, modal) {
    modal.style.display = open ? 'block' : 'none';
    document.body.style.overflow = open ? 'hidden' : 'auto';
}

document.querySelectorAll('#btn-modale').forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    loadModalContent();
    toggleModal(true, modal1);
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



ajouterButton.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            ajouterDiv.innerHTML = `<img src="${e.target.result}"  style="max-width: 100%; max-height: 100%;"/>`;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const fileInput = document.getElementById('photo')
    if (fileInput.files.length > 0) {
        formData.append('photo', fileInput.files[0]);
    } 

    fetch('http://localhost:5678/api/works', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log('Succès:', data);
        toggleModal(false, modal2);
        loadModalContent();
    })
    .catch(error => console.error('Erreur:', error));
});


(async function init() {
    const works = await getWork();
    displayWorks(works, 'all');
})();
