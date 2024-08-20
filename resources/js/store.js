import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    comments: [],
  },
  mutations: {
    SET_COMMENTS(state, comments) {
      state.comments = comments;
    },
    ADD_COMMENT(state, comment) {
      state.comments.push(comment);
    },
    DELETE_COMMENT(state, commentId) {
      state.comments = state.comments.filter(comment => comment.id !== commentId);
    }
  },
  actions: {
    async fetchComments({ commit }) {
      try {
        const response = await axios.get('/api/comments/');
        commit('SET_COMMENTS', response.data);
      } catch (error) {
        console.error('Ошибка при загрузке комментариев:', error);
      }
    },
    async addComment({ commit }, newComment) {
      try {
        const response = await axios.post('/api/comments/', newComment);
        commit('ADD_COMMENT', response.data);
        return response;
      } catch (error) {
        console.error('Ошибка при добавлении комментария:', error);
      }
    },
    async deleteComment({ commit }, commentId) {
      try {
        await axios.delete(`/api/comments/${commentId}`);
        commit('DELETE_COMMENT', commentId);
      } catch (error) {
        console.error('Ошибка при удалении комментария:', error);
      }
    }
  },
  getters: {
    comments: state => state.comments,
    sortedComments: (state) => (sortBy, sortDirection) => {
      return [...state.comments].sort((a, b) => {
        let compare = 0;
        if (sortBy === 'date') {
          compare = new Date(a.date) - new Date(b.date);
        } else if (sortBy === 'id') {
          compare = a.id - b.id;
        }
        return sortDirection === 'asc' ? compare : -compare;
      });
    },
    paginatedComments: (state, getters) => (sortBy, sortDirection, currentPage, pageSize) => {
      const sortedComments = getters.sortedComments(sortBy, sortDirection);
      const start = (currentPage - 1) * pageSize;
      return sortedComments.slice(start, start + pageSize);
    },
    totalPages: (state, getters) => (sortBy, sortDirection, pageSize) => {
      const sortedComments = getters.sortedComments(sortBy, sortDirection);
      return Math.ceil(sortedComments.length / pageSize);
    }
  }
});
