// Fonction pour ouvrir un modal spécifique
const openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block'; 
        modal.removeAttribute('aria-hidden');
        modal.setAttribute('aria-modal', 'true');
        document.body.style.overflow = 'hidden'; 
    }
};

// Fonction pour fermer un modal spécifique
const closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none'; 
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
        document.body.style.overflow = 'auto'; 
    }
};

// Fonction pour gérer l'upload de la photo
const uploadPhoto = async function (file) {
    try {
        const token = localStorage.getItem("authToken");

        if (!token) {
            console.error("Un token d'authentification n'a pas été trouvé. Assurez-vous que vous êtes connecté.");
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('title', 'New Photo'); // Ajoute un titre par défaut ou modifie en fonction du besoin

        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData
        });

        if (response.ok) {
            console.log("Photo téléchargée avec succès");
            await loadModalContent(); // Recharge le contenu pour afficher la nouvelle photo
            await updateMainContent(); // Mise à jour du contenu de la page principale
        } else {
            console.error(`Erreur lors du téléchargement de la photo: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Erreur lors du téléchargement de la photo:", error);
    }
};

// Fonction pour charger le contenu du modal
const loadModalContent = async function () {
    try {
        const works = await getWork();
        const modalContent = document.getElementById('modalContent');
        modalContent.innerHTML = '';

        works.forEach(work => {
            const workItem = document.createElement('div');
            workItem.classList.add('work-item');
            workItem.innerHTML = `
                <img src="${work.imageUrl}" alt="${work.title}" width="100">
                <button class="delete-button" data-id="${work.id}">
                    <i class="fa fa-trash"></i>
                </button>
            `;
            modalContent.appendChild(workItem);
        });

        // Attribuer un événement click à chaque bouton de suppression
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault(); 
                e.stopPropagation(); 

                const workId = e.currentTarget.getAttribute('data-id');
                const isDeleted = await deleteWork(workId);

                if (isDeleted) {
                    e.currentTarget.parentElement.remove(); // Supprime l'élément du DOM uniquement si la suppression a réussi
                    await updateMainContent(); // Mise à jour du contenu de la page principale
                }
            });
        });
    } catch (error) {
        console.error("Erreur lors du chargement des tâches:", error);
    }
};

// Gérer l'ouverture et la fermeture des modaux
document.getElementById('btn-modale').addEventListener('click', () => openModal('modal1'));

// Passer de modal1 à modal2 en cliquant sur "Ajouter une photo"
document.getElementById('add-photo-btn').addEventListener('click', () => {
    closeModal('modal1'); // Ferme modal1
    openModal('modal2');  // Ouvre modal2
});

// Ouvrir modal2 lorsqu'on clique sur le bouton de téléchargement de photo
document.getElementById('upload-photo-btn').addEventListener('click', () => {
    document.getElementById('file-input').click(); 
});

// Gérer les changements dans l'input de fichier pour télécharger la photo
document.getElementById('file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        uploadPhoto(file);
    }
});

// Fermer les modaux lorsqu'on clique sur le bouton de fermeture
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => closeModal('modal1'));
});

document.querySelectorAll('.close-modal-2').forEach(btn => {
    btn.addEventListener('click', () => closeModal('modal2'));
});

// Fermer les modaux lorsqu'on clique en dehors du modal-wrapper
document.querySelectorAll('.modal1, .modal2').forEach(modal => {
    modal.addEventListener('click', function (e) {
        if (!e.target.closest('.modal-wrapper, .modal-wrapper-2')) {
            closeModal(modal.id);
        }
    });
});

// Initialiser le contenu principal à l'ouverture de la page
document.addEventListener('DOMContentLoaded', updateMainContent);
