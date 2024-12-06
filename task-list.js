class TaskList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.tasks = this.loadTasksFromStorage();  
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: 'Roboto', Arial, sans-serif;
                    max-width: 600px;
                    margin: 50px auto;
                    background-color: #1e1e2f;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
                    border-radius: 10px;
                    overflow: hidden;
                    color: #ffffff;
                }
    
                /* Фон всей страницы */
                body {
                    margin: 0;
                    font-family: 'Roboto', Arial, sans-serif;
                    background: radial-gradient(circle at center, #1e1e2f, #0d0d14);
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                }
    
                .background-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: radial-gradient(circle, rgba(98, 0, 234, 0.1), transparent);
                    pointer-events: none;
                    z-index: -1;
                }
    
                /* Контейнер задач */
                .task-list-container {
                    list-style-type: none;
                    padding: 0;
                    margin: 0;
                }
    
                .task-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px;
                    border-bottom: 1px solid #333344;
                    background-color: #2a2a3d;
                    transition: background-color 0.3s ease, transform 0.2s ease;
                }
    
                .task-item:last-child {
                    border-bottom: none;
                }
    
                .task-item:hover {
                    background-color: #3b3b5a;
                    transform: translateX(5px);
                }
    
                .task-item.completed {
                    text-decoration: line-through;
                    background-color: #304d30;
                    color: #81c784;
                }
    
                .task-text {
                    flex-grow: 1;
                    margin-right: 10px;
                    font-size: 16px;
                }
    
                .task-item button {
                    background-color: #e57373;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 8px 12px;
                    border-radius: 5px;
                    font-size: 14px;
                    transition: background-color 0.3s ease, transform 0.2s ease;
                }
    
                .task-item button:hover {
                    background-color: #d32f2f;
                    transform: scale(1.1);
                }
    
                input[type="text"] {
                    padding: 12px;
                    width: calc(100% - 120px);
                    margin-right: 10px;
                    font-size: 16px;
                    border: 1px solid #444455;
                    background-color: #2a2a3d;
                    color: #ffffff;
                    border-radius: 5px;
                    outline: none;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                }
    
                input[type="text"]:focus {
                    border-color: #4caf50;
                    box-shadow: 0 0 8px rgba(76, 175, 80, 0.8);
                }
    
                .dodav {
                    text-decoration: none;
                    background: linear-gradient(90deg, #6200ea, #3700b3);
                    color: #ffffff;
                    border: none;
                    font-size: 16px;
                    padding: 12px 20px;
                    border-radius: 5px;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: background-position 0.3s ease, box-shadow 0.3s ease;
                    background-size: 200%;
                }
    
                .dodav:hover {
                    background-position: right;
                    box-shadow: 0 4px 12px rgba(98, 0, 234, 0.7);
                }
    
                .add-task-form {
                    display: flex;
                    padding: 20px;
                    border-bottom: 1px solid #333344;
                }
    
                .task-item input[type="checkbox"] {
                    margin-right: 10px;
                    transform: scale(1.2);
                    cursor: pointer;
                    accent-color: #4caf50;
                }
    
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
    
                .task-item {
                    animation: fadeIn 0.5s ease forwards;
                }
            </style>
            <div>
                <!-- Фон-оверлей -->
                <div class="background-overlay"></div>
    
                <form class="add-task-form">
                    <input type="text" id="new-task" placeholder="Добавить новую задачу">
                    <button type="submit" class="dodav">Добавить</button>
                </form>
                <ul class="task-list-container">
                    ${this.tasks.map((task, index) => `
                        <li class="task-item ${task.completed ? 'completed' : ''}">
                            <input type="checkbox" class="task-checkbox" data-index="${index}" ${task.completed ? 'checked' : ''}>
                            <span class="task-text">${task.text}</span>
                            <button class="delete-task" data-index="${index}">Удалить</button>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    
        this.addEventListeners();
    }
    
    

    addEventListeners() {
        const addTaskForm = this.shadowRoot.querySelector('.add-task-form');
        addTaskForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const taskInput = this.shadowRoot.querySelector('#new-task');
            if (taskInput.value.trim()) {
                this.addTask(taskInput.value.trim());
                taskInput.value = '';
            }
        });

        const markDoneCheckboxes = this.shadowRoot.querySelectorAll('.task-checkbox');
        markDoneCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                const index = event.target.getAttribute('data-index');
                this.toggleTaskCompletion(index);
            });
        });

        const deleteButtons = this.shadowRoot.querySelectorAll('.delete-task');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.getAttribute('data-index');
                this.deleteTask(index);
            });
        });
    }

    addTask(text) {
        this.tasks = [...this.tasks, { text, completed: false }];
        this.saveTasksToStorage(); 
        this.render();
    }

    deleteTask(index) {
        this.tasks = this.tasks.filter((_, i) => i !== parseInt(index));
        this.saveTasksToStorage();  
        this.render();
    }

    toggleTaskCompletion(index) {
        this.tasks = this.tasks.map((task, i) => {
            if (i === parseInt(index)) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        this.saveTasksToStorage();  
        this.render();
    }

    loadTasksFromStorage() {
        const storedTasks = localStorage.getItem('tasks');
        return storedTasks ? JSON.parse(storedTasks) : [];  
    }

    saveTasksToStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks)); 
    }
}

customElements.define('task-list', TaskList);
