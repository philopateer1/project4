const gallery = document.getElementById('gallery');

async function loadImages() {
	try {
		const response = await fetch('http://localhost:3000/api/images');
		if (!response.ok) {
			throw new Error('Failed to fetch image list');
		}

		const imageFiles = await response.json();
		imageFiles.forEach(img => {
			const colDiv = document.createElement('div');
			colDiv.classList.add('col-6', 'mb-3');

			const imgElement = document.createElement('img');
			imgElement.src = `/images/${img}`;
			imgElement.classList.add('img-fluid', 'rounded');
			imgElement.alt = img;

			colDiv.appendChild(imgElement);
			gallery.appendChild(colDiv);

			imgElement.addEventListener('click', () => {
				const width = prompt('Enter desired width in pixels (e.g. 200):', imgElement.width);
				const height = prompt('Enter desired height in pixels (e.g. 200):', imgElement.height);
				if (width !== null && height !== null) {
					const widthNum = parseInt(width);
					const heightNum = parseInt(height);
					if (!isNaN(widthNum) && !isNaN(heightNum) && widthNum > 0 && heightNum > 0) {
						imgElement.style.width = widthNum + 'px';
						imgElement.style.height = heightNum + 'px';
					} else {
						alert('Please enter valid positive numbers for width and height.');
					}
				}
			});
		});
		console.log('Images added to gallery');
	} catch (error) {
		console.error('Error loading images:', error);
	}
}

loadImages();

const photoForm = document.getElementById('photoForm');
const fileInput = photoForm.querySelector('input[type=\'file\']');

photoForm.addEventListener('submit', async event => {
	event.preventDefault();

	const file = fileInput.files[0];
	if (!file) {
		alert('Please select a file to upload.');
		return;
	}

	if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
		alert('Only JPG images are allowed.');
		return;
	}

	const formData = new FormData();
	formData.append('photo', file);

	try {
		const response = await fetch('http://localhost:3000/api/upload', {
			method: 'POST',
			body: formData,
		});

		if (!response.ok) {
			throw new Error('Failed to upload image');
		}

		const result = await response.json();
		const newImageName = result.filename;

		// Add the new image to the gallery
		const gallery = document.getElementById('gallery');
		const colDiv = document.createElement('div');
		colDiv.classList.add('col-6', 'mb-3');
		const imgElement = document.createElement('img');
		imgElement.src = `/images/${newImageName}`;
		imgElement.classList.add('img-fluid', 'rounded');
		imgElement.alt = newImageName;

		colDiv.appendChild(imgElement);
		gallery.appendChild(colDiv);

		// Clear the file input
		fileInput.value = '';
	} catch (error) {
		alert('Error uploading image: ' + error.message);
	}
});