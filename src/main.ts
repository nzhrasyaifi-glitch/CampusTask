
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

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Elemen aplikasi tidak ditemukan')
}

function saveTasks(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

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

function renderTaskGroup(
  containerId: string,
  taskItems: Task[],
  emptyMessage: string
): void {
  const container = document.querySelector<HTMLDivElement>(`#${containerId}`)
  if (!container) return

  if (taskItems.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span>🌷</span>
        <h3>Belum ada tugas</h3>
        <p>${emptyMessage}</p>
      </div>
    `
    return
  }

  container.innerHTML = taskItems.map(task => `
    <article class="task-card">
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
    </article>
  `).join('')
}

function renderTasks(): void {
  const done = tasks.filter(task => task.status === 'Selesai')
  const pending = tasks.filter(task => task.status === 'Belum Selesai')

  const totalElement = document.querySelector<HTMLSpanElement>('#total-tasks')
  const doneElement = document.querySelector<HTMLSpanElement>('#completed-tasks')
  const pendingElement = document.querySelector<HTMLSpanElement>('#pending-tasks')
  const progressPercentage = document.querySelector<HTMLSpanElement>('#progress-percentage')
  const progressFill = document.querySelector<HTMLDivElement>('#progress-fill')
  const progressCaption = document.querySelector<HTMLParagraphElement>('#progress-caption')
  const progressDone = document.querySelector<HTMLSpanElement>('#progress-done')
  const progressPending = document.querySelector<HTMLSpanElement>('#progress-pending')
  const pendingCount = document.querySelector<HTMLSpanElement>('#pending-count')
  const doneCount = document.querySelector<HTMLSpanElement>('#done-count')

  const percentage = tasks.length === 0
    ? 0
    : Math.round((done.length / tasks.length) * 100)

  if (
    !totalElement ||
    !doneElement ||
    !pendingElement ||
    !progressPercentage ||
    !progressFill ||
    !progressCaption ||
    !progressDone ||
    !progressPending ||
    !pendingCount ||
    !doneCount
  ) return

  totalElement.textContent = String(tasks.length)
  doneElement.textContent = String(done.length)
  pendingElement.textContent = String(pending.length)

  progressPercentage.textContent = `${percentage}%`
  progressFill.style.width = `${percentage}%`

  progressCaption.textContent = tasks.length === 0
    ? 'Belum ada tugas. Yuk, tambahkan tugas pertamamu!'
    : `${done.length} dari ${tasks.length} tugas sudah selesai. Semangat! 💙`

  progressDone.textContent = String(done.length)
  progressPending.textContent = String(pending.length)

  pendingCount.textContent = String(pending.length)
  doneCount.textContent = String(done.length)

  renderTaskGroup(
    'pending-list',
    pending,
    'Tidak ada tugas yang perlu dikerjakan!.'
  )

  renderTaskGroup(
    'done-list',
    done,
    'Belum ada tugas yang diselesaikan.'
  )
}

function switchView(view: string): void {
  const views = ['dashboard', 'pending', 'done', 'add']

  if (!views.includes(view)) return

  document.querySelectorAll<HTMLElement>('.page-view').forEach(page => {
    page.classList.remove('active')
  })

  document.querySelector(`#${view}-view`)?.classList.add('active')

  document.querySelectorAll<HTMLAnchorElement>('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.view === view)
  })

  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    pending: 'Tugas Belum Selesai',
    done: 'Tugas Selesai',
    add: 'Tambah Tugas'
  }

  const pageTitle = document.querySelector<HTMLHeadingElement>('#page-title')

  if (pageTitle) {
    pageTitle.textContent = titles[view]
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

app.innerHTML = `
  <div class="dashboard-layout">

    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">🎓</div>
        <div>
          <h2>${escapeHTML(appName)}</h2>
          <span>Student Workspace</span>
        </div>
      </div>

      <div class="sidebar-menu">
        <p class="menu-label">MENU UTAMA</p>

        <a href="#" class="nav-link active" data-view="dashboard">
          </span> Dashboard
        </a>

        <a href="#" class="nav-link" data-view="pending">
          </span> Belum Selesai
          <span class="nav-count" id="sidebar-pending">0</span>
        </a>

        <a href="#" class="nav-link" data-view="done">
          </span> Selesai
          <span class="nav-count" id="sidebar-done">0</span>
        </a>

        <a href="#" class="nav-link" data-view="add">
          <span>➕</span> Tambah Tugas
        </a>
      </div>

      <div class="sidebar-bottom">
        <div class="sidebar-decoration">💜</div>
        <p>Small steps every day lead to big achievements.</p>
        <span>Keep going!</span>
      </div>
    </aside>

    <main class="main-content">

      <header class="topbar">
        <div>
          <p class="topbar-label">STUDENT TASK MANAGER</p>
          <h1 id="page-title">Dashboard</h1>
        </div>

        <div class="profile">
          <div class="profile-avatar">N</div>
          <div>
            <strong>Nadhifa Zahra Syaifi</strong>
            <span>Mahasiswa</span>
          </div>
        </div>
      </header>

      <div class="page-view active" id="dashboard-view">

        <section class="welcome-card">
          <div>
            <span class="welcome-label">WELCOME BACK </span>
            <h2>Halo, Nadhifa!</h2>
            <p>
              Siap menyelesaikan tugas kuliah hari ini?
              Yuk, atur kegiatanmu dan capai target belajarmu.
            </p>
            <a href="#" class="welcome-button" data-view="add">
              + Tambah Tugas
            </a>
          </div>

          <div class="welcome-illustration">📚</div>
        </section>

        <section class="overview-section">
          <div class="section-title">
            <div>
              <h2>Overview</h2>
              <p>Ringkasan aktivitas tugas kuliahmu.</p>
            </div>
          </div>

          <div class="statistics">
            <div class="stat-card stat-blue">
              <div class="stat-icon">📋</div>
              <span>Total Tugas</span>
              <strong id="total-tasks">0</strong>
              <small>Semua tugas kuliah</small>
            </div>

            <div class="stat-card stat-purple">
              <div class="stat-icon">📝</div>
              <span>Belum Selesai</span>
              <strong id="pending-tasks">0</strong>
              <small>Perlu dikerjakan</small>
            </div>

            <div class="stat-card stat-green">
              <div class="stat-icon">🌷</div>
              <span>Selesai</span>
              <strong id="completed-tasks">0</strong>
              <small>Berhasil diselesaikan</small>
            </div>
          </div>
        </section>

        <section class="progress-card">
          <div class="progress-heading">
            <div>
              <span class="small-label">YOUR ACHIEVEMENT</span>
              <h2>My Progress</h2>
              <p>Pantau perkembangan tugas kuliahmu.</p>
            </div>

            <span class="progress-percentage" id="progress-percentage">0%</span>
          </div>

          <div class="progress-track">
            <div class="progress-fill" id="progress-fill"></div>
          </div>

          <p class="progress-caption" id="progress-caption"></p>

          <div class="progress-details">
            <div class="progress-detail">
              <span>Sudah Selesai</span>
              <strong id="progress-done">0</strong>
            </div>

            <div class="progress-detail">
              <span>Belum Selesai</span>
              <strong id="progress-pending">0</strong>
            </div>
          </div>
        </section>

      </div>

      <div class="page-view" id="pending-view">
        <section class="task-section">
          <div class="section-title">
            <div>
              <h2>Tugas Belum Selesai</h2>
              <p>Daftar tugas yang masih perlu kamu kerjakan.</p>
            </div>
            <span class="section-count" id="pending-count">0</span>
          </div>

          <div class="task-list" id="pending-list"></div>
        </section>
      </div>

      <div class="page-view" id="done-view">
        <section class="task-section">
          <div class="section-title">
            <div>
              <h2>Tugas Selesai</h2>
              <p>Yeay! Ini tugas yang sudah berhasil kamu selesaikan.</p>
            </div>
            <span class="section-count" id="done-count">0</span>
          </div>

          <div class="task-list" id="done-list"></div>
        </section>
      </div>

      <div class="page-view" id="add-view">
        <section class="content-card">
          <div class="section-title">
            <div>
              <h2>Tambah Tugas Baru</h2>
              <p>Catat tugas kuliah agar tidak ada yang terlewat.</p>
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
                <input id="task-deadline" type="date">
              </div>
            </div>

            <div class="form-buttons">
              <button type="submit" class="add-btn" id="submit-btn">
                + Tambah Tugas
              </button>

              <button type="button" class="cancel-btn" id="cancel-btn" hidden>
                Batal Edit
              </button>
            </div>
          </form>
        </section>
      </div>

      <footer>
        © 2026 ${escapeHTML(appName)} · 1247050020_Nadhifa Zahra Syaifi
      </footer>

    </main>
  </div>
`

const form = document.querySelector<HTMLFormElement>('#task-form')!
const titleInput = document.querySelector<HTMLInputElement>('#task-title')!
const courseInput = document.querySelector<HTMLInputElement>('#task-course')!
const deadlineInput = document.querySelector<HTMLInputElement>('#task-deadline')!
const taskIdInput = document.querySelector<HTMLInputElement>('#task-id')!
const submitButton = document.querySelector<HTMLButtonElement>('#submit-btn')!
const cancelButton = document.querySelector<HTMLButtonElement>('#cancel-btn')!

function resetEdit(): void {
  taskIdInput.value = ''
  submitButton.textContent = '+ Tambah Tugas'
  cancelButton.hidden = true
}

function updateSidebarCounts(): void {
  const pending = tasks.filter(task => task.status === 'Belum Selesai').length
  const done = tasks.filter(task => task.status === 'Selesai').length

  const pendingBadge = document.querySelector('#sidebar-pending')
  const doneBadge = document.querySelector('#sidebar-done')

  if (pendingBadge) pendingBadge.textContent = String(pending)
  if (doneBadge) doneBadge.textContent = String(done)
}

function refreshTasks(): void {
  renderTasks()
  updateSidebarCounts()
}

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
        ? { ...task, title, course, deadline }
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
  refreshTasks()
  switchView('pending')
})

cancelButton.addEventListener('click', () => {
  form.reset()
  resetEdit()
  switchView('pending')
})

app.addEventListener('click', event => {
  const target = event.target as HTMLElement

  const navigationItem = target.closest<HTMLElement>('[data-view]')

  if (navigationItem) {
    event.preventDefault()
    switchView(navigationItem.dataset.view || 'dashboard')
    return
  }

  const button = target.closest<HTMLButtonElement>('button')

  if (!button) return

  const id = Number(button.dataset.id)
  if (!id) return

  if (button.classList.contains('delete-btn')) {
    const confirmed = confirm('Yakin ingin menghapus tugas ini?')
    if (!confirmed) return

    tasks = tasks.filter(task => task.id !== id)
    saveTasks()
    refreshTasks()
  }

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
    refreshTasks()
  }

  if (button.classList.contains('edit-btn')) {
    const task = tasks.find(item => item.id === id)
    if (!task) return

    taskIdInput.value = String(task.id)
    titleInput.value = task.title
    courseInput.value = task.course
    deadlineInput.value = task.deadline

    submitButton.textContent = 'Simpan Perubahan'
    cancelButton.hidden = false

    switchView('add')
    titleInput.focus()
  }
})

refreshTasks()

console.log(
  `${appName} versi ${appVersion} siap digunakan: ${isAppReady}`
)
