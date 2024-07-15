const api = axios.create({
  baseURL: 'https://api.thedogapi.com/v1',
});
api.defaults.headers.common['X-API-KEY'] =
  'live_QGiILdeKcgXqUxNihwf6GxVbTlSwp6wQtkDH4mf86arJUKeNtlLwOj1GuwBboYYj';

const API_URL_RANDOM = '/images/search?limit=2';
const API_URL_FAVORITE = (userId) => `/favourites?sub_id=${userId}`;
const API_URL_REMOVE_FAVORITE = (dogId) => `/favourites/${dogId}`;
const API_URL_UPLOAD = '/images/upload';
const API_URL_GET_UPLOADED = (userId) => `/images/?limit=10&sub_id=${userId}`;
const API_URL_REMOVE_UPLOADED = (dogId) => `/images/${dogId}`;
let userId;

const userContent = document.getElementById('user');
const userIdContent = document.getElementById('userId');
const buttonLogin = document.getElementById('button-login');
const buttonUpload = document.getElementById('button-upload');
const favoritesContent = document.getElementById('favorites-container');
const buttonRandom = document.getElementById('button-random');
const buttonBottom = document.getElementById('button-bottom');
const buttonTop = document.getElementById('button-top');
const uploadedContent = document.getElementById('uploaded-container');
const preview = document.getElementById('preview');
const file = document.getElementById('file');
const loadingContainer = document.getElementById('loadingContainer');

async function getRandomDog() {
  try {
    const { data, status } = await api.get(API_URL_RANDOM);
    console.log('random', data);
    const imgDog1 = document.getElementById('dog1');
    const imgDog2 = document.getElementById('dog2');
    const btn1 = document.getElementById('button-add-1');
    const btn2 = document.getElementById('button-add-2');
    imgDog1.src = data[0].url;
    imgDog2.src = data[1].url;

    btn1.onclick = () => {
      addToFavorites(data[0].id);
    };

    btn2.onclick = () => {
      addToFavorites(data[1].id);
    };
  } catch (error) {
    console.log(error);
    Swal.fire({
      icon: 'error',
      title: `Oops... Could not get random dog!`,
      text: `${error}`,
    });
  }
}

async function loadFavorites() {
  try {
    const { data, status } = await api.get(API_URL_FAVORITE(userId));
    console.log('favoritos ', data);

    if (data.length === 0) {
      let view = `
        <article>
          <h3>No favorites yet!</h3>
        </article>
        `;
      favoritesContent.innerHTML = view;
    } else {
      let view = `
      ${data
        .map(
          (dog) => `
          <article>
            <img alt="Picture of favorite doggo" id="${dog.id}" src="${dog.image.url}" />
            <button id="button-remove" onclick="removeFromFavorites('${dog.id}')">
              <img src="./assets/icons/unfav.svg" alt="" class="icon" />
            </button>
          </article>
        `
        )
        .join('')}
      `;
      favoritesContent.innerHTML = view;
    }
    return data;
  } catch (error) {
    console.log(error);
    Swal.fire({
      icon: 'error',
      title: `Oops... Could not load favorites!`,
      text: `${error}`,
    });
  }
}

async function addToFavorites(dogId) {
  try {
    if (
      userId !== null &&
      userId !== '' &&
      userId !== undefined &&
      userId !== ' '
    ) {
      const favorites = await loadFavorites();
      const isInFavorites = favorites.find((dog) => dog.image_id === dogId);
      if (isInFavorites) {
        Swal.fire({
          icon: 'warning',
          title: 'This doggo is already in favorites!',
          showConfirmButton: false,
          timer: 2500,
        });
      } else {
        const response = await api.post(URL_FAVORITE(userId), {
          image_id: dogId,
          sub_id: userId,
        });
        // const response = await fetch(API_URL_FAVORITE(userId), {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'X-API-KEY': API_KEY,
        //   },
        //   body: JSON.stringify({
        //     image_id: dogId,
        //     sub_id: userId,
        //   }),
        // });
        // const data = await response.json();

        Swal.fire({
          icon: 'success',
          title: 'You have added a doggo to favorites!',
          showConfirmButton: false,
          timer: 2500,
        });
        loadFavorites();
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'You have to log in to add a doggo to favorites!',
        showConfirmButton: false,
        timer: 2500,
      });
    }
  } catch (error) {
    console.log(error);
    Swal.fire({
      icon: 'error',
      title: `Oops... Could not add to favorites!`,
      text: `${error}`,
    });
  }
}

async function removeFromFavorites(dogId) {
  try {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Do you want to remove this doggo from favorites?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      denyButtonText: `No, keep it!`,
    });

    if (result.isConfirmed) {
      const { data, status } = await api.delete(API_URL_REMOVE_FAVORITE(dogId));
      loadFavorites();
      Swal.fire({
        icon: 'success',
        title: 'You have removed this doggo from favorites!',
        showConfirmButton: false,
        timer: 2500,
      });
    } else if (result.isDenied) {
      Swal.fire({
        icon: 'info',
        title: 'This doggo has not been removed from favorites',
        showConfirmButton: false,
        timer: 2500,
      });
    }
  } catch (error) {
    console.log(error);
    Swal.fire({
      icon: 'error',
      title: 'Oops... Could not be removed from favorites!',
      text: `${error}`,
    });
  }
}

async function uploadDoggo() {
  try {
    const file = document.getElementById('file').files[0];
    const fileSize = file.size;
    loadingContainer.style.display = 'block';

    if (fileSize === 0) {
      Swal.fire({
        icon: 'error',
        title: 'You have to upload a doggo!',
        showConfirmButton: false,
        timer: 2500,
      });
    } else {
      const form = document.getElementById('form-upload');
      const formData = new FormData(form);
      formData.append('sub_id', userId);
      const { data, status } = await api.post(API_URL_UPLOAD, formData);

      if (status === 201) {
        loadingContainer.style.display = 'none';
        Swal.fire({
          icon: 'success',
          title: 'You have uploaded a doggo!',
          showConfirmButton: false,
          timer: 2500,
        });
        preview.innerHTML = ``;
        loadUploadedDoggos();
      }
    }
  } catch (error) {
    console.log(error);
    Swal.fire({
      icon: 'error',
      title: `Oops... Could not upload doggo!`,
      text: `${error}`,
    });
  }
}

async function loadUploadedDoggos() {
  try {
    const { data, status } = await api.get(API_URL_GET_UPLOADED(userId));
    console.log('uploaded ', data);

    if (data.length === 0) {
      let view = `
        <article>
          <h3>No uploaded doggos yet!</h3>
        </article>
        `;
      uploadedContent.innerHTML = view;
    } else {
      let view = `
      ${data
        .map(
          (dog) => `
          <article>
            <img alt="Picture of uploaded doggo" id="${dog.id}" src="${dog.url}" />
            <button id="button-remove" onclick="removeFromUploaded('${dog.id}')">
              <img src="./assets/icons/unfav.svg" alt="" class="icon" />
            </button>
          </article>
        `
        )
        .join('')}
      `;
      uploadedContent.innerHTML = view;
    }
  } catch (error) {
    console.log(error);
    Swal.fire({
      icon: 'error',
      title: `Oops... Could not load uploaded doggos!`,
      text: `${error}`,
    });
  }
}

async function removeFromUploaded(dogId) {
  try {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Do you want to remove this doggo from uploaded?',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      denyButtonText: `No, keep it!`,
    });

    if (result.isConfirmed) {
      const { data, status } = await api.delete(API_URL_REMOVE_UPLOADED(dogId));
      loadUploadedDoggos();
      Swal.fire({
        icon: 'success',
        title: 'You have removed this doggo from uploaded!',
        showConfirmButton: false,
        timer: 2500,
      });
    } else if (result.isDenied) {
      Swal.fire({
        icon: 'info',
        title: 'This doggo has not been removed from uploaded',
        showConfirmButton: false,
        timer: 2500,
      });
    }
  } catch (error) {
    console.log(error);
    Swal.fire({
      icon: 'error',
      title: 'Oops... Could not be removed from uploaded!',
      text: `${error}`,
    });
  }
}

file.addEventListener('change', (e) => {
  const name = e.target.files[0].name;
  const size = () => {
    const kb = e.target.files[0].size / 1024;
    const mb = kb / 1024;
    return mb > 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
  };

  if (
    e.target.files[0].type === 'image/jpeg' ||
    e.target.files[0].type === 'image/png'
  ) {
    reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = `
      <div class="preview">
        <img src="${e.target.result}" alt="Preview of uploaded doggo" />
        <div class="info">
          <p>${name}</p>
          <p>${size()}</p>
        </div>
      </div>
      `;
    };
    reader.readAsDataURL(e.target.files[0]);
  } else {
    Swal.fire({
      icon: 'error',
      title: 'You have to upload a picture!',
      showConfirmButton: false,
      timer: 2500,
    });
  }
});

buttonLogin.addEventListener('click', () => {
  userId = document.getElementById('user-input').value;
  if (
    userId !== '' &&
    userId !== null &&
    userId !== undefined &&
    userId !== ' '
  ) {
    Swal.fire({
      icon: 'success',
      title: `Hi ${userId}! You have logged in!`,
      showConfirmButton: false,
      timer: 2500,
    });
    loadFavorites();
    loadUploadedDoggos();
    userContent.innerHTML = `${userId}'s favorites`;
    userIdContent.innerHTML = `${userId} is logged in.`;
  } else {
    Swal.fire({
      icon: 'error',
      title: 'You have to enter a correct username!',
      showConfirmButton: false,
      timer: 2500,
    });
  }
});

buttonUpload.addEventListener('click', () => {
  if (
    userId !== null &&
    userId !== '' &&
    userId !== undefined &&
    userId !== ' '
  ) {
    uploadDoggo();
  } else {
    Swal.fire({
      icon: 'error',
      title: 'You have to log in to upload a doggo!',
      showConfirmButton: false,
      timer: 2500,
    });
  }
});

buttonRandom.addEventListener('click', () => getRandomDog());

buttonBottom.addEventListener('click', () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth',
  });
});

buttonTop.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
});

loadUploadedDoggos();
loadFavorites();
getRandomDog();
