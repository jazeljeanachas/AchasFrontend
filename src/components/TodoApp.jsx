import { useState, useEffect } from 'react';
import '../App.css';

const baseURL = 'http://localhost:8000/api/todos/';

function Todolist() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [filter, setFilter] = useState('all');
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        fetch(baseURL)
            .then(response => response.json())
            .then(data => setTasks(data))
            .catch(error => console.error('Error fetching todos:', error));
    }, []);

    useEffect(() => {
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme) {
            setDarkMode(JSON.parse(savedTheme));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        document.body.className = darkMode ? 'dark' : 'light';
    }, [darkMode]);

    const addTask = async (newTask) => {
        try {
            const response = await fetch(baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: newTask, completed: false }),
            });

            if (response.ok) {
                const data = await response.json();
                setTasks((prevTasks) => [...prevTasks, data]);
            } else {
                console.error('Failed to add task');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleAddTask = () => {
        if (newTask.trim() !== '') {
            addTask(newTask);
            setNewTask('');
        }
    };

    const handleEditStart = (task) => {
        setEditingId(task.id);
        setEditText(task.title);
    };

    const handleEditSave = () => {
        if (editText.trim() !== '') {
            setTasks(tasks.map(task =>
                task.id === editingId ? { ...task, title: editText } : task
            ));
            setEditingId(null);
        }
    };

    const toggleComplete = (id) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${baseURL}${id}/`, {
                method: 'DELETE',
            });
    
            if (response.ok) {
                setTasks(tasks.filter(task => task.id !== id));
            } else {
                console.error('Failed to delete task from server');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'completed') return task.completed;
        if (filter === 'pending') return !task.completed;
        return true;
    });

    return (
        <div className={`todo-container ${darkMode ? 'dark-mode' : ''}`}>
            <div className="todo-header">
                <h1>To-Do List</h1>
                <button
                    onClick={toggleDarkMode}
                    className="theme-toggle"
                >
                    {darkMode ? '☀︎' : '⏾'}
                </button>
            </div>

            <div className="add-task-container">
                <input
                    type="text"
                    className="add-task-input"
                    placeholder="Add a new task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                />
                <button
                    onClick={handleAddTask}
                    className="add-button"
                >
                    Add
                </button>
            </div>

            <div className="filter-container">
                <button
                    onClick={() => setFilter('all')}
                    className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
                >
                    Completed
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`filter-button ${filter === 'pending' ? 'active' : ''}`}
                >
                    Pending
                </button>
            </div>

            <ul className="task-list">
                {filteredTasks.map(task => (
                    <li key={task.id} className="task-item">
                        <div className="task-content">
                            <input
                                type="checkbox"
                                className="task-checkbox"
                                checked={task.completed}
                                onChange={() => toggleComplete(task.id)}
                            />

                            {editingId === task.id ? (
                                <input
                                    type="text"
                                    className="edit-input"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    autoFocus
                                />
                            ) : (
                                <span className={task.completed ? 'completed-task' : ''}>
                                    {task.title}
                                </span>
                            )}
                        </div>

                        <div className="task-actions">
                            {editingId === task.id ? (
                                <button onClick={handleEditSave} className="save-button">
                                    Save
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleEditStart(task)}
                                    className="edit-button"
                                >
                                    Edit
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(task.id)}
                                className="delete-button"
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

            {tasks.length === 0 && (
                <p className="empty-message">No tasks yet. Add a task to get started!</p>
            )}
        </div>
    );
}

export default Todolist;
