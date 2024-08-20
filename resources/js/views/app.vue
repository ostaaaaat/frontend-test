<template>
    <div>
        <h1>Комментарии</h1>
        <div class="sort-controls">
            <label for="sortBy">Сортировка</label>
            <select id="sortBy" v-model="sortBy">
                <option value="date">Дата</option>
                <option value="id">ID</option>
            </select>

            <label for="sortDirection">Направление сортировки:</label>
            <select id="sortDirection" v-model="sortDirection">
                <option value="asc">По возрастанию</option>
                <option value="desc">По убыванию</option>
            </select>
        </div>

        <div class="comments-list">
            <div v-for="comment in paginatedComments" :key="comment.id" class="comment-item">
                <p><strong>{{ comment.name }}</strong>: {{ comment.text }} (Дата: {{ comment.date }})</p>
                <button @click="deleteComment(comment.id)" class="delete-button">Удалить</button>
            </div>
        </div>
    
        <div class="pagination">
            <button
                v-for="page in pagesArray"
                :key="page"
                @click="currentPage = page"
                :class="{ active: currentPage === page }"
            >
            {{ page }}
            </button>
            
        </div>
        <form @submit.prevent="addComment" class="comment-form">
            <div class="form-group">
                <label for="commenterName">Имя:</label>
                <input id="commenterName" v-model="newCommentName" placeholder="Введите имя" required />
            </div>
            <div class="form-group">
                <label for="commentText">Комментарий:</label>
                <textarea id="commentText" v-model="newCommentText" placeholder="Введите комментарий" required></textarea>
            </div> 
                <div class="form-group row">
                <label for="commentDate">Дата:</label>
                <datepicker
                    v-model="newCommentDate"
                    format="YYYY-MM-DD"
                    date-format="YYYY-MM-DD"
                    type="date"
                    confirm
                ></datepicker>
            </div>
            <button type="submit" class="add-comment-button">Добавить</button>
        </form>
    </div>
</template>

<script>
import axios from 'axios';
import Datepicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';

export default {
  components: {
    Datepicker
  },
  data() {
    return {
      comments: [],
      sortBy: 'date',
      sortDirection: 'asc',
      currentPage: 1,
      pageSize: 3,
      newCommentName: '',
      newCommentText: '',
      newCommentDate: null,
    };
  },
  computed: {
    // Сортировка
    sortedComments() {
      return [...this.comments].sort((a, b) => {
        let compare = 0;
        if (this.sortBy === 'date') {
          compare = new Date(a.date) - new Date(b.date);
        } else if (this.sortBy === 'id') {
            compare = a.id - b.id;
        }
        return this.sortDirection === 'asc' ? compare : -compare;
      });
    },
    // Разбиение комментариев на страницы
    paginatedComments() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.sortedComments.slice(start, start + this.pageSize);
    },
    // Вычисление общего числа страниц
    totalPages() {
      return Math.ceil(this.sortedComments.length / this.pageSize);
    },
    // Массив для кнопок страниц
    pagesArray() {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
  },
  methods: {
    // Загрузка комментариев с сервера
    async fetchComments() {
      try {
        const response = await axios.get('/api/comments/');
        this.comments = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке комментариев:', error);
      }
    },
    // Генерация нового ID для комментария
    getNextId() {
      const maxId = this.comments.reduce((max, comment) => Math.max(max, comment.id), 0);
      return maxId + 1;
    },
    // Добавление нового комментария
    async addComment() {
    if (this.newCommentName.trim() === '' || this.newCommentText.trim() === '' || !this.newCommentDate) return;
    
    // Форматирование даты для правильного отображения
    const date = new Date(this.newCommentDate);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const newComment = {
        id: this.getNextId(),
        name: this.newCommentName,
        text: this.newCommentText,
        date: formattedDate
    };

    try {
      await axios.post('/api/comments/', newComment);
      this.comments.push(newComment);
      this.newCommentName = '';
      this.newCommentText = '';
      this.newCommentDate = null;
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
    }
  },
    // Удаление комментария по ID
    async deleteComment(commentId) {
        try {
            await axios.delete(`/api/comments/${commentId}`);
            this.comments = this.comments.filter(comment => comment.id !== commentId);
        } catch (error) {
            console.error('Ошибка при удалении комментария:', error);
        }
    }
  },
  // Загрузка комментариев при создании компонента
  created() {
    this.fetchComments();
  }
};
</script>

