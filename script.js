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
        this.editingTaskId = null;
        this.init();
    }
    
    // Inicializar a aplicação
    init() {
        this.renderGrid();
        this.setupEventListeners();
        this.showNotification('Agenda carregada com sucesso!', 'success');
    }
    
    // Carregar tarefas do localStorage
    loadTasks() {
        try {
            const storedTasks = localStorage.getItem('weeklyAgenda');
            return storedTasks ? JSON.parse(storedTasks) : {};
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            this.showNotification('Erro ao carregar tarefas salvas', 'error');
            return {};
        }
    }
    
    // Salvar tarefas no localStorage
    saveTasks() {
        try {
            localStorage.setItem('weeklyAgenda', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Erro ao salvar tarefas:', error);
            this.showNotification('Erro ao salvar tarefas', 'error');
        }
    }
    
    // Adicionar uma nova tarefa
    addTask(task, day, time) {
        // Validar dados
        if (!task.trim() || !day || !time) {
            this.showNotification('Preencha todos os campos corretamente', 'error');
            return;
        }
        
        let id;
        
        // Se estiver editando, usar o ID existente
        if (this.editingTaskId) {
            id = this.editingTaskId;
            this.removeTask(id, false); // Remove a versão antiga sem salvar ainda
        } else {
            // Criar ID único para a tarefa
            id = Date.now().toString();
        }
        
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
        
        // Mostrar mensagem de sucesso
        if (this.editingTaskId) {
            this.showNotification('Tarefa atualizada com sucesso!', 'success');
            this.cancelEdit();
        } else {
            this.showNotification('Tarefa adicionada com sucesso!', 'success');
        }
    }
    
    // Remover uma tarefa
    removeTask(id, showNotification = true) {
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
        
        // Mostrar mensagem
        if (showNotification) {
            this.showNotification('Tarefa removida com sucesso!', 'success');
        }
    }
    
    // Iniciar edição de uma tarefa
    startEdit(id) {
        // Encontrar a tarefa
        for (const day in this.tasks) {
            const task = this.tasks[day].find(t => t.id === id);
            if (task) {
                // Preencher o formulário com os dados da tarefa
                document.getElementById('task').value = task.task;
                document.getElementById('day').value = day;
                document.getElementById('time').value = task.time;
                
                // Alterar o texto do botão
                document.getElementById('submit-btn').textContent = 'Atualizar Tarefa';
                
                // Salvar o ID da tarefa sendo editada
                this.editingTaskId = id;
                
                // Rolar até o formulário
                document.querySelector('.form-container').scrollIntoView({ 
                    behavior: 'smooth' 
                });
                
                break;
            }
        }
    }
    
    // Cancelar edição
    cancelEdit() {
        this.editingTaskId = null;
        document.getElementById('task-form').reset();
        document.getElementById('submit-btn').textContent = 'Adicionar Tarefa';
    }
    
    // Renderizar a grade semanal
    renderGrid() {
        const weekGrid = document.getElementById('week-grid');
        let html = '';
        
        this.days.forEach(day => {
            const dayClass = this.dayClasses[day];
            
            // Determinar o texto do cabeçalho
            let dayHeaderText = day;
            if (day !== 'Sábado' && day !== 'Domingo') {
                dayHeaderText += '-feira';
            }
            
            html += `
                <div class="day-column ${dayClass}">
                    <div class="day-header">${dayHeaderText}</div>
                    <div class="tasks-container" id="tasks-${day}">
            `;
            
            if (this.tasks[day] && this.tasks[day].length > 0) {
                this.tasks[day].forEach(task => {
                    html += `
                        <div class="task-item">
                            <div class="task-time">${this.formatTime(task.time)}</div>
                            <div class="task-content">${task.task}</div>
                            <div class="task-actions">
                                <button class="edit-btn" data-id="${task.id}">Editar</button>
                                <button class="delete-btn" data-id="${task.id}">X</button>
                            </div>
                        </div>
                    `;
                });
            } else {
                html += `<div class="empty-day">Nenhuma tarefa agendada</div>`;
            }
            
            html += `
                    </div>
                </div>
            `;
        });
        
        weekGrid.innerHTML = html;
        
        // Adicionar event listeners aos botões
        this.setupActionButtons();
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
            
            this.addTask(task, day, time);
            
            // Limpar formulário apenas se não estiver editando
            if (!this.editingTaskId) {
                form.reset();
            }
        });
        
        // Adicionar botão de cancelar edição quando estiver editando
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancelar Edição';
        cancelButton.type = 'button';
        cancelButton.style.marginLeft = '10px';
        cancelButton.style.backgroundColor = '#6c757d';
        cancelButton.addEventListener('click', () => this.cancelEdit());
        
        const submitButton = document.getElementById('submit-btn').parentNode;
        submitButton.appendChild(cancelButton);
    }
    
    // Configurar botões de ação (excluir e editar)
    setupActionButtons() {
        const deleteButtons = document.querySelectorAll('.delete-btn');
        const editButtons = document.querySelectorAll('.edit-btn');
        
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                    this.removeTask(id);
                }
            });
        });
        
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                this.startEdit(id);
            });
        });
    }
    
    // Mostrar notificação
    showNotification(message, type) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new AgendaManager();
});