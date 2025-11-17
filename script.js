// Classe para gerenciar a agenda
class AgendaManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
        this.dayClasses = {
            'Segunda': 'monday',
            'Terça': 'tuesday', 
            'Quarta': 'wednesday',
            'Quinta': 'thursday',
            'Sexta': 'friday',
            'Sábado': 'saturday',
            'Domingo': 'sunday'
        };
        this.init();
    }
    
    // Inicializar a aplicação
    init() {
        this.renderGrid();
        this.setupEventListeners();
    }
    
    // Carregar tarefas do localStorage
    loadTasks() {
        const storedTasks = localStorage.getItem('weeklyAgenda');
        return storedTasks ? JSON.parse(storedTasks) : {};
    }
    
    // Salvar tarefas no localStorage
    saveTasks() {
        localStorage.setItem('weeklyAgenda', JSON.stringify(this.tasks));
    }
    
    // Adicionar uma nova tarefa
    addTask(task, day, time) {
        // Criar ID único para a tarefa
        const id = Date.now().toString();
        
        // Inicializar o array do dia se não existir
        if (!this.tasks[day]) {
            this.tasks[day] = [];
        }
        
        // Adicionar a tarefa
        this.tasks[day].push({
            id: id,
            task: task,
            time: time
        });
        
        // Ordenar tarefas por horário
        this.tasks[day].sort((a, b) => a.time.localeCompare(b.time));
        
        // Salvar no localStorage
        this.saveTasks();
        
        // Atualizar a grade
        this.renderGrid();
    }
    
    // Remover uma tarefa
    removeTask(id) {
        for (const day in this.tasks) {
            this.tasks[day] = this.tasks[day].filter(task => task.id !== id);
            
            // Remover o dia se não houver mais tarefas
            if (this.tasks[day].length === 0) {
                delete this.tasks[day];
            }
        }
        
        // Salvar no localStorage
        this.saveTasks();
        
        // Atualizar a grade
        this.renderGrid();
    }
    
    // Renderizar a grade semanal
    renderGrid() {
        const weekGrid = document.getElementById('week-grid');
        let html = '';
        
        this.days.forEach(day => {
            const dayClass = this.dayClasses[day];
            html += `
                <div class="day-column ${dayClass}">
                    <div class="day-header">${day}-feira</div>
                    <div class="tasks-container" id="tasks-${day}">
            `;
            
            if (this.tasks[day] && this.tasks[day].length > 0) {
                this.tasks[day].forEach(task => {
                    html += `
                        <div class="task-item">
                            <div class="task-time">${this.formatTime(task.time)}</div>
                            <div class="task-content">${task.task}</div>
                            <button class="delete-btn" data-id="${task.id}">X</button>
                        </div>
                    `;
                });
            } else {
                html += `<div class="empty-day">Nenhuma tarefa</div>`;
            }
            
            html += `
                    </div>
                </div>
            `;
        });
        
        weekGrid.innerHTML = html;
        
        // Adicionar event listeners aos botões de exclusão
        this.setupDeleteButtons();
    }
    
    // Formatar horário para exibição
    formatTime(time) {
        const [hours, minutes] = time.split(':');
        return `${hours}:${minutes}`;
    }
    
    // Configurar event listeners
    setupEventListeners() {
        const form = document.getElementById('task-form');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const taskInput = document.getElementById('task');
            const daySelect = document.getElementById('day');
            const timeInput = document.getElementById('time');
            
            const task = taskInput.value.trim();
            const day = daySelect.value;
            const time = timeInput.value;
            
            if (task && day && time) {
                this.addTask(task, day, time);
                
                // Limpar formulário
                form.reset();
            }
        });
    }
    
    // Configurar botões de exclusão
    setupDeleteButtons() {
        const deleteButtons = document.querySelectorAll('.delete-btn');
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.removeTask(id);
            });
        });
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new AgendaManager();
});