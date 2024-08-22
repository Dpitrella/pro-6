const modal1 = document.getElementById('modal1');
const modal2 = document.getElementById('modal2');
const modalContent = document.getElementById('modalContent');
const authToken = localStorage.getItem("authToken");
const ajouterButton = document.getElementById('ajouter-button');
const fileInput = document.getElementById('file-input');
const ajouterDiv = document.getElementById('ajouter');
const gallery = document.querySelector('.gallery'); 

//* bloquer l'accès à la modification *//
document.addEventListener('DOMContentLoaded', async () => {
    const referrer = document.referrer;

    if (!authToken || !referrer.includes('login.html')) {
        window.location.href = 'login.html';
    } else {
        try {
            const response = await fetch('http://localhost:5678/api/validate-token', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            
        } catch (error) {
            console.error('Erreur lors de la validation du token:', error);
            localStorage.removeItem('authToken');
            window.location.href = 'login.html';
        }
    }
});

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
    if (!authToken){
        window.location.href = 'login.html'
        return 
    } 
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

document.getElementById('myForm').addEventListener('click', function(event) {
    const formData = new FormData();
    const fileInput = document.getElementById('file-input')
    formData.append('title', document.querySelector('#title').value)
    formData.append('category', document.querySelector('#category').value)

    if (fileInput.files.length > 0) {
        formData.append('image', fileInput.files[0]);
    } 

    fetch('http://localhost:5678/api/works', {
        headers: {
            "authorization" : "Bearer " + authToken,
        },
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log('Succès:', data);
        // toggleModal(false, modal2);
        // loadModalContent();
    })
    .catch(error => console.error('Erreur:', error));
});


(async function init() {
    const works = await getWork();
    displayWorks(works, 'all');
})();


document.addEventListener('DOMContentLoaded', () => {
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
