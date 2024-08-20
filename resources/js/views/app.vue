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

    <form @submit.prevent="handleAddComment" class="comment-form">
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
import { mapActions, mapGetters } from 'vuex';
import Datepicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';

export default {
  components: {
    Datepicker
  },
  data() {
    return {
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
    ...mapGetters(['paginatedComments', 'totalPages']),
    pagesArray() {
      return Array.from({ length: this.totalPages(this.sortBy, this.sortDirection, this.pageSize) }, (_, i) => i + 1);
    },
    paginatedComments() {
        return this.$store.getters.paginatedComments(this.sortBy, this.sortDirection, this.currentPage, this.pageSize);
    }
  },
  methods: {
    ...mapActions(['fetchComments', 'addComment', 'deleteComment']),
    async handleAddComment() {
      if (this.newCommentName.trim() === '' || this.newCommentText.trim() === '' || !this.newCommentDate) return;

      const date = new Date(this.newCommentDate);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      const newComment = {
        
        name: this.newCommentName,
        text: this.newCommentText,
        date: formattedDate,
      };

      try {
      const response = await this.addComment(newComment);
      const addedComment = response.data;
      this.newCommentName = '';
      this.newCommentText = '';
      this.newCommentDate = null;
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
    }
    },
  },
  created() {
    this.fetchComments();
  }
};
</script>
