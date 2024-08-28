const filterContainer = document.querySelector('.filters'); 
const gallery = document.querySelector('.gallery'); 
let modalContent = document.querySelector('.modalContent')
//**************** API WORKS ************//

async function getWork() {
    let response = await fetch("http://localhost:5678/api/works");
    let data = await response.json();
    return data;
}

//*************** API FILTERS *********//

async function getFilters() {
    let response = await fetch("http://localhost:5678/api/categories");
    let data = await response.json();
    return data;
}

//*********** BUTTONS *************//

async function createFilterButtons() {
    const fragment = document.createDocumentFragment();

    
    const allButton = document.createElement('button');
    allButton.textContent = 'Tous';
    allButton.classList.add('filter-button', 'active'); 
    allButton.dataset.categoryId = 'all';
    fragment.appendChild(allButton);

    
    const categories = await getFilters();

    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category.name;
        button.classList.add('filter-button');
        button.dataset.categoryId = category.id;
        fragment.appendChild(button);
    });

    filterContainer.appendChild(fragment);
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


filterContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('filter-button')) {

        // - class 'active' 

        const buttons = filterContainer.querySelectorAll('.filter-button');
        buttons.forEach(btn => btn.classList.remove('active'));

        // + class 'active' 

        event.target.classList.add('active');

        // get id categoty

        const filterId = event.target.dataset.categoryId;

        
        getWork().then(works => displayWorks(works, filterId));
    }
});


(async function init() {
    await createFilterButtons();
    const works = await getWork();
    displayWorks(works, 'all');
})();






    
