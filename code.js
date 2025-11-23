const add_button = document.querySelector(".add-button")
const ok_button = document.querySelector(".ok_button")
const cancel_button = document.querySelector(".cancel_button")

const notdone_list = document.querySelector(".notdone-list")
const inprogress_list = document.querySelector(".inprogress-list")
const done_list = document.querySelector(".done-list")

// фильтры
const all_filter = document.querySelector(".all")
const work_fiter = document.querySelector(".work")
const home_filter = document.querySelector(".home")
const study_filter = document.querySelector(".study")
const other_filter = document.querySelector(".other")

// Что-то в духе Enum`а
const Stage = { NotDone: "notdone", InProgress: "inprogress", Done: "done" }
const Category = { home: "home", study: "study", work: "work", other: "other" }
const Priority = { low: "low", medium: "medium", high: "high" }


let tasks = []
let draggedTaskIndex = null
let draggedTaskElement = null
let editingTask = null

let currentFilter = "all"

!localStorage.tasks ? tasks = [] : tasks = JSON.parse(localStorage.getItem('tasks'))

const updateLocalStorage = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
}

const doesTaskShow = (task) => {
    return currentFilter === "all" || task.category === currentFilter
}


add_button.addEventListener("click", () => {
    const task_value = document.querySelector(".task-title").value
    const categories_value = document.querySelector(".categ").value
    const priorities_value = document.querySelector(".prior").value
    if (task_value == "") {
        alert("Empty task name");
        return;
    }
    if (task_value.length > 20) {
        alert("Title size mustn`t be bigger than 20")
        return
    }
    let new_task = {
        "name": task_value,
        "stage": Stage.NotDone,
        "category": Category[categories_value],
        "priority": Priority[priorities_value]
    }
    tasks.push(new_task)
    show_all_tasks()
});

const show_all_tasks = () => {
    let notdone_s = '';
    let inprogress_s= '';
    let done_s = "";
    tasks.forEach((item, index) => {
        if (!doesTaskShow(item)) { return }
        const taskHTML = show_task(item, index)
        if (item.stage === Stage.NotDone) {
            notdone_s += taskHTML
        } else if (item.stage === Stage.InProgress) {
            inprogress_s += taskHTML
        } else if (item.stage === Stage.Done) {
            done_s += taskHTML
        }
    });
    notdone_list.innerHTML = notdone_s;
    inprogress_list.innerHTML = inprogress_s;
    done_list.innerHTML = done_s;

    addDragAndDropListeners();
    updateLocalStorage()
}

const del_task = (index) => {
    tasks.splice(index, 1)
    show_all_tasks()
}

const show_task = (task, index) => {
    return `
    <div class="task" draggable="true" data-index="${index}">
        <div class="info">
            <div class="top_info">
               <p>${task.name}</p>
            </div>
            <div class=bot_info>
                <p>${task.category}</p>
                <p>${task.priority}</p>
            </div>
        </div>
        <div class="buttons">
            <button class="edit_button" onclick="edit_task(${index})">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 19H6.425L16.2 9.225L14.775 7.8L5 17.575V19ZM3 21V16.75L16.2 3.575C16.4 3.39167 16.6208 3.25 16.8625 3.15C17.1042 3.05 17.3583 3 17.625 3C17.8917 3 18.15 3.05 18.4 3.15C18.65 3.25 18.8667 3.4 19.05 3.6L20.425 5C20.625 5.18333 20.7708 5.4 20.8625 5.65C20.9542 5.9 21 6.15 21 6.4C21 6.66667 20.9542 6.92083 20.8625 7.1625C20.7708 7.40417 20.625 7.625 20.425 7.825L7.25 21H3ZM15.475 8.525L14.775 7.8L16.2 9.225L15.475 8.525Z"/>
                </svg>

            </button>
            <button class="del_button" onclick="del_task(${index})">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z"/>
                </svg>
            </button>
        </div>
    </div>
    `
}

const edit_task = (index) => {
    editingTask = tasks[index]

    document.querySelector(".task-title").value = tasks[index].name
    document.querySelector(".categ").value = tasks[index].category
    document.querySelector(".prior").value = tasks[index].priority
    add_button.classList.add("invisible")
    div_buttons = document.querySelector(".ok_cancel_buttons")

    div_buttons.innerHTML = `
    <button class="ok_button" onclick="ok_edit(${index})">ok</button>
    <button class="cancel_button" onclick="cancel_edit()">cancel</button>
    `
    div_buttons.classList.add("all_wide")
}

const cancel_edit = () => {
    add_button.classList.remove("invisible")
    document.querySelector(".ok_button").remove()
    document.querySelector(".cancel_button").remove()

    document.querySelector(".task-title").value = ''
    document.querySelector(".categ").value = Category.other
    document.querySelector(".prior").value = Priority.low

    div_buttons.classList.remove("all_wide")
}

const ok_edit = (index) => {
    const task_value = document.querySelector(".task-title").value
    const categories_value = document.querySelector(".categ").value
    const priorities_value = document.querySelector(".prior").value
    if (task_value == "") {
        alert("Empty task name")
        return;
    }
    if (task_value == "") {
        alert("Empty task name")
        return;
    }
    // фикс бага: раньше нельзя было закрыть окно редактирования у удалённой таски
    if (tasks[index] == editingTask) {
        set_task_values(index, task_value, categories_value, priorities_value)
    }
    cancel_edit()
    show_all_tasks()
}

const set_task_values = (index, new_name, new_category, new_priority) => {
    let new_tasks = [
        ...tasks.slice(0, index),
        {
            "name": new_name,
            "stage": tasks[index].stage,
            "category": new_category,
            "priority": new_priority
        },
        ...tasks.slice(index + 1)
    ]
    tasks = new_tasks
}

// drag and drop (ужас)
const addDragAndDropListeners = () => {
    const tasks = document.querySelectorAll('.task')
    const columns = document.querySelectorAll('.notdone-list, .inprogress-list, .done-list')

    tasks.forEach(task => {
        task.addEventListener('dragstart', handleDragStart)
        task.addEventListener('dragend', handleDragEnd)
    })

    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver)
        column.addEventListener('dragenter', handleDragEnter)
        column.addEventListener('dragleave', handleDragLeave)
        column.addEventListener('drop', handleDrop)
    })
}

const handleDragStart = (e) => {
    draggedTaskElement = e.target.closest('.task')
    draggedTaskIndex = parseInt(draggedTaskElement.getAttribute('data-index'))
    draggedTaskElement.classList.add('dragging')
}

const handleDragEnd = (e) => {
    draggedTaskElement.classList.remove('dragging')
    draggedTaskElement = null
    draggedTaskIndex = null
}

const handleDragOver = (e) => {
    e.preventDefault()
}

const handleDragEnter = (e) => {
    e.preventDefault();
    const column = e.target.closest('.notdone-list, .inprogress-list, .done-list')
    if (column) {
        column.classList.add('drag-over')
    }
}

const handleDragLeave = (e) => {
    e.preventDefault();
    const column = e.target.closest('.notdone-list, .inprogress-list, .done-list')
    const rect = column.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    // чтобы пофиксить сброс выделения при наведение на внутренние объекты
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
        column.classList.remove('drag-over')
    }
}

const handleDrop = (e) => {
    e.preventDefault();
    const column = e.target.closest('.notdone-list, .inprogress-list, .done-list')
    if (!column) return
    const columns = document.querySelectorAll('.notdone-list, .inprogress-list, .done-list')
    columns.forEach(column => {
        column.classList.remove("drag-over")
    })

    let newStage;
    if (column.classList.contains('notdone-list')) {
        newStage = Stage.NotDone
    } else if (column.classList.contains('inprogress-list')) {
        newStage = Stage.InProgress
    } else if (column.classList.contains('done-list')) {
        newStage = Stage.Done
    }

    if (tasks[draggedTaskIndex].stage !== newStage) {
        tasks[draggedTaskIndex].stage = newStage
        show_all_tasks()
    }
}

all_filter.addEventListener("click", () => {
    currentFilter = "all"
    show_all_tasks()
})

work_fiter.addEventListener("click", () => {
    currentFilter = Category.work
    show_all_tasks()
})

home_filter.addEventListener("click", () => {
    currentFilter = Category.home
    show_all_tasks()
})

study_filter.addEventListener("click", () => {
    currentFilter = Category.study
    show_all_tasks()
})

other_filter.addEventListener("click", () => {
    currentFilter = Category.other
    show_all_tasks()
})

show_all_tasks()