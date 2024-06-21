import firebaseConfig from './config.js';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Authentication Functions
function showSignup() {
    document.getElementById('signup-form').style.display = 'block';
    document.getElementById('login-form').style.display = 'none';
}

function showLogin() {
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

function signup() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            alert('Signup successful!');
            showLogin();
        })
        .catch(error => alert(error.message));
}

function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            document.getElementById('auth').style.display = 'none';
            document.getElementById('main').style.display = 'block';
            loadTasks();
        })
        .catch(error => alert(error.message));
}

function logout() {
    auth.signOut().then(() => {
        document.getElementById('auth').style.display = 'block';
        document.getElementById('main').style.display = 'none';
    });
}

// Firestore Functions
function addTask() {
    const taskInput = document.getElementById('task-input');
    const task = taskInput.value.trim();
    if (task) {
        db.collection('tasks').add({
            task: task,
            userId: auth.currentUser.uid
        }).then(() => {
            taskInput.value = '';
            loadTasks();
        });
    }
}

function loadTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    db.collection('tasks').where('userId', '==', auth.currentUser.uid)
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const task = doc.data().task;
                const li = document.createElement('li');
                li.textContent = task;
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = () => deleteTask(doc.id);
                li.appendChild(deleteButton);
                taskList.appendChild(li);
            });
        });
}

function deleteTask(taskId) {
    db.collection('tasks').doc(taskId).delete().then(() => {
        loadTasks();
    });
}

// Listen for Auth State Changes
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('auth').style.display = 'none';
        document.getElementById('main').style.display = 'block';
        loadTasks();
    } else {
        document.getElementById('auth').style.display = 'block';
        document.getElementById('main').style.display = 'none';
    }
});
