
import './style.css'

const appName: string = import.meta.env.VITE_APP_NAME || 'CampusTask'
const appVersion: string = import.meta.env.VITE_APP_VERSION || '1.0.0'
const isAppReady: boolean = true

type TaskStatus = 'Belum Selesai' | 'Selesai'

interface Task {
  id: number
  title: string
  course: string
  deadline: string
  status: TaskStatus
}

const STORAGE_KEY = 'campustask-data'
const SAMPLE_KEY = 'campustask-sample-initialized'

// Contoh tugas awal
const sampleTasks: Task[] = [
  {
    id: 1001,
    title: 'Membuat Web Sederhana',
    course: 'Pengembangan Aplikasi Web',
    deadline: '2026-11-30',
    status: 'Belum Selesai'
  },
  {
    id: 1002,
    title: 'Latihan MangoDB',
    course: 'Manajemen Basis Data',
    deadline: '2026-11-15',
    status: 'Belum Selesai'
  },
  {
    id: 1003,
    title: 'Membuat Esai',
    course: 'Interaksi Manusia dan Komputer',
    deadline: '2026-11-15',
    status: 'Selesai'
  },
  {
    id: 1004,
    title: 'Lanjutkan NetAcad',
    course: 'Jaringan Komputer',
    deadline: '2026-11-30',
    status: 'Belum Selesai'
  }
]

// Mengambil data dari LocalStorage
function loadTasks(): Task[] {
  const savedData = localStorage.getItem(STORAGE_KEY)

  if (savedData) {
    try {
      const parsedData: unknown = JSON.parse(savedData)

      if (Array.isArray(parsedData)) {
        return parsedData as Task[]
      }
    } catch {
      console.error('Data tugas tidak dapat dibaca.')
    }
  }

  if (localStorage.getItem(SAMPLE_KEY) !== 'true') {
    localStorage.setItem(SAMPLE_KEY, 'true')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleTasks))
    return [...sampleTasks]
  }

  return []
}

let tasks: Task[] = loadTasks()

// Contoh penggunaan Generic
function getFirst<T>(items: T[]): T | undefined {
  return items[0]
}

// Mengambil elemen aplikasi
const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Elemen aplikasi tidak ditemukan')
}

// Menyimpan data tugas
function saveTasks(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

// Mengamankan teks sebelum ditampilkan
function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, char => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }

    return entities[char]
  })
}

// Mengubah format tanggal menjadi bahasa Indonesia
function formatDeadline(date: string): string {
  if (!date) return '-'

  const parsedDate = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(parsedDate)
}

// Menampilkan daftar tugas
function renderTasks(): void {
  const taskList = document.querySelector<HTMLDivElement>('#task-list')
  const total = document.querySelector<HTMLSpanElement>('#total-tasks')
  const completed = document.querySelector<HTMLSpanElement>('#completed-tasks')
  const pending = document.querySelector<HTMLSpanElement>('#pending-tasks')

  if (!taskList || !total || !completed || !pending) return

  const done = tasks.filter(task => task.status === 'Selesai').length
  const waiting = tasks.length - done

  total.textContent = String(tasks.length)
  completed.textContent = String(done)
  pending.textContent = String(waiting)

  taskList.innerHTML = ''

  if (tasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>Belum ada tugas</h3>
        <p>Tambahkan tugas kuliah pertamamu sekarang!</p>
      </div>
    `
    return
  }

  tasks.forEach(task => {
    const card = document.createElement('div')
    card.className = 'task-card'

    card.innerHTML = `
      <div class="task-info">
        <span class="status ${task.status === 'Selesai' ? 'done' : 'pending'}">
          ${escapeHTML(task.status)}
        </span>

        <h3>${escapeHTML(task.title)}</h3>

        <p>📚 ${escapeHTML(task.course)}</p>

        <p>📅 Deadline: ${escapeHTML(formatDeadline(task.deadline))}</p>
      </div>

      <div class="task-actions">
        <button type="button" class="complete-btn" data-id="${task.id}">
          ${task.status === 'Selesai' ? 'Batalkan' : 'Selesaikan'}
        </button>

        <button type="button" class="edit-btn" data-id="${task.id}">
          Edit
        </button>

        <button type="button" class="delete-btn" data-id="${task.id}">
          Hapus
        </button>
      </div>
    `

    taskList.appendChild(card)
  })
}

// Tampilan utama aplikasi
app.innerHTML = `
  <header class="navbar">
    <div class="brand">🎓 ${escapeHTML(appName)}</div>
    <span class="welcome">Nadhifa Zahra Syaifi</span>
  </header>

  <main class="container">

    <section class="hero">
      <div>
        <p class="eyebrow">STUDENT TASK MANAGER</p>

        <h1>Halo, Nadhifa Zahra Syaifi! </h1>

        <p>
          Atur tugas kuliahmu, selesaikan satu per satu,
          dan raih target belajarmu.
        </p>
      </div>

      <div class="hero-icon">📚</div>
    </section>

    <section class="statistics">

      <div class="stat-card">
        <span>Total Tugas</span>
        <strong id="total-tasks">0</strong>
      </div>

      <div class="stat-card">
        <span>Selesai</span>
        <strong id="completed-tasks">0</strong>
      </div>

      <div class="stat-card">
        <span>Belum Selesai</span>
        <strong id="pending-tasks">0</strong>
      </div>

    </section>

    <section class="content-card">

      <div class="section-heading">
        <div>
          <h2>Daftar Tugas Kuliah </h2>

          <p>
            Pantau semua tugas, mata kuliah,
            dan deadline dalam satu tempat.
          </p>
        </div>
      </div>

      <form id="task-form">

        <input type="hidden" id="task-id">

        <div class="form-grid">

          <div class="form-group">
            <label for="task-title">Nama Tugas</label>

            <input
              id="task-title"
              type="text"
              placeholder="Contoh: Membuat makalah"
              required
            >
          </div>

          <div class="form-group">
            <label for="task-course">Mata Kuliah</label>

            <input
              id="task-course"
              type="text"
              placeholder="Contoh: Basis Data"
              required
            >
          </div>

          <div class="form-group">
            <label for="task-deadline">Deadline</label>

            <input
              id="task-deadline"
              type="date"
            >
          </div>

        </div>

        <button
          type="submit"
          class="add-btn"
          id="submit-btn"
        >
          + Tambah Tugas Baru
        </button>

        <button
          type="button"
          class="cancel-btn"
          id="cancel-btn"
          hidden
        >
          Batal Edit
        </button>

      </form>

      <div class="task-list" id="task-list"></div>

    </section>

    <footer>
      © 2026 ${escapeHTML(appName)} · 1247050020_Nadhifa Zahra Syaifi
    </footer>

  </main>
`

// Mengambil elemen form
const form = document.querySelector<HTMLFormElement>('#task-form')!
const titleInput = document.querySelector<HTMLInputElement>('#task-title')!
const courseInput = document.querySelector<HTMLInputElement>('#task-course')!
const deadlineInput = document.querySelector<HTMLInputElement>('#task-deadline')!
const taskIdInput = document.querySelector<HTMLInputElement>('#task-id')!
const submitButton = document.querySelector<HTMLButtonElement>('#submit-btn')!
const cancelButton = document.querySelector<HTMLButtonElement>('#cancel-btn')!

// Mengembalikan form ke kondisi awal
function resetEdit(): void {
  taskIdInput.value = ''
  submitButton.textContent = '+ Tambah Tugas Baru'
  cancelButton.hidden = true
}

// Menambahkan dan mengedit tugas
form.addEventListener('submit', event => {
  event.preventDefault()

  const title = titleInput.value.trim()
  const course = courseInput.value.trim()
  const deadline = deadlineInput.value
  const editId = Number(taskIdInput.value)

  if (!title || !course) return

  if (editId) {
    tasks = tasks.map(task =>
      task.id === editId
        ? {
            ...task,
            title,
            course,
            deadline
          }
        : task
    )
  } else {
    tasks.push({
      id: Date.now(),
      title,
      course,
      deadline,
      status: 'Belum Selesai'
    })
  }

  saveTasks()
  form.reset()
  resetEdit()
  renderTasks()
})

// Membatalkan proses edit
cancelButton.addEventListener('click', () => {
  form.reset()
  resetEdit()
})

// Mengelola tombol pada daftar tugas
document.querySelector<HTMLDivElement>('#task-list')!
  .addEventListener('click', event => {
    const target = event.target as HTMLElement
    const button = target.closest('button') as HTMLButtonElement | null

    if (!button) return

    const id = Number(button.dataset.id)

    if (!id) return

    // Menghapus tugas
    if (button.classList.contains('delete-btn')) {
      const confirmed = confirm('Yakin ingin menghapus tugas ini?')

      if (!confirmed) return

      tasks = tasks.filter(task => task.id !== id)

      saveTasks()
      renderTasks()
    }

    // Mengubah status tugas
    if (button.classList.contains('complete-btn')) {
      tasks = tasks.map(task =>
        task.id === id
          ? {
              ...task,
              status: task.status === 'Selesai'
                ? 'Belum Selesai'
                : 'Selesai'
            }
          : task
      )

      saveTasks()
      renderTasks()
    }

    // Mengedit tugas
    if (button.classList.contains('edit-btn')) {
      const task = tasks.find(item => item.id === id)

      if (!task) return

      taskIdInput.value = String(task.id)
      titleInput.value = task.title
      courseInput.value = task.course
      deadlineInput.value = task.deadline

      submitButton.textContent = 'Simpan Perubahan'
      cancelButton.hidden = false

      titleInput.focus()
    }
  })

// Menampilkan tugas pertama kali
renderTasks()

console.log(
  `${appName} versi ${appVersion} siap digunakan: ${isAppReady}`
)

console.log('Tugas pertama:', getFirst(tasks))
