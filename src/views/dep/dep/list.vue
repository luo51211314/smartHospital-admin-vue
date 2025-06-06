<template>
    <div class="app-container">

    <el-card class="operate-container" shadow="never">
      <div style="margin-top: 15px">
        <el-form :inline="true" size="small" label-width="140px">
          <el-form-item label="输入搜索：">
            <el-input style="width: 203px" v-model="tempSearchObj.departmentname" placeholder="科室名"></el-input>
          </el-form-item>

          <el-button type="primary" icon="el-icon-search" @click="getdepartments()">查询</el-button>
          <el-button type="default" @click="resetSearch()">清空</el-button>
        </el-form>
      </div>
    </el-card>

    <!-- 工具条 -->
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" style="margin-top: 5px"></i>
      <span style="margin-top: 5px">数据列表</span>
      <el-button class="btn-add" size="mini" @click="showAdddepartment">添 加</el-button>
      <el-button class="btn-add" size="mini" @click="revomvedepartments" :disabled="selectedIds.length===0" style="margin: 0 10px;">批量删除</el-button>
    </el-card>

    <!-- banner列表 -->
    <el-table
      v-loading="listLoading"
      :data="departments"
      stripe
      border
      style="width: 100%;margin-top: 10px;"
      @selection-change="handleSelectionChange">

      <el-table-column
        type="selection"
        width="55" />

      <el-table-column
        type="index"
        label="序号"
        width="80"
        align="center"
      />

      <el-table-column prop="departmentname" label="科室名" width="120" />
      <el-table-column prop="phone" label="电话" width="140" />
      <el-table-column prop="createTime" label="创建时间" width="180"/>
      <el-table-column prop="updateTime" label="更新时间" width="180"/>

      <el-table-column label="操作" width="220" align="center">
<!--        <template slot-scope="{row}">-->
<!--          <HintButton type="info" size="mini" icon="el-icon-department-solid" title="分配角色"-->
<!--            @click="showAssignRole(row)" v-if="$hasBP('btn.department.assgin')" />-->
<!--          <HintButton type="primary" size="mini" icon="el-icon-edit" title="修改科室"-->
<!--            @click="showUpdatedepartment(row)" v-if="$hasBP('btn.department.update')"/>-->
<!--          <el-popconfirm :title="`确定删除 ${row.departmentname} 吗?`" @onConfirm="removedepartment(row.id)">-->
<!--            <HintButton style="margin-left:10px" slot="reference" type="danger" size="mini" icon="el-icon-delete"-->
<!--              title="删除科室" v-if="$hasBP('btn.department.remove')"/>-->
<!--          </el-popconfirm>-->
<!--        </template>-->
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="showUpdatedepartment(scope.row)">修改</el-button>
          <el-button type="text" size="mini" @click="removedepartment(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      :current-page="page"
      :total="total"
      :page-size="limit"
      :page-sizes="[5, 10, 20, 30, 40, 50, 100]"
      style="padding: 20px 0;"
      layout="prev, pager, next, jumper, ->, sizes, total"
      @current-change="getdepartments"
      @size-change="handleSizeChange"
    />

    <el-dialog :title="department.id ? '修改科室' : '添加科室'" :visible.sync="dialogdepartmentVisible">
      <el-form ref="departmentForm" :model="department" :rules="departmentRules" label-width="120px">
        <el-form-item label="科室名" prop="departmentname">
          <el-input v-model="department.departmentname"/>
        </el-form-item>

        <el-form-item label="科室电话">
          <el-input v-model="department.phone"/>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
        <el-button :loading="loading" type="primary" @click="addOrUpdate">确 定</el-button>
      </div>
    </el-dialog>

    </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'AcldepartmentList',

  data () {
    return {
      listLoading: false, // 是否显示列表加载的提示
      searchObj: { // 包含请求搜索条件数据的对象
        departmentname: ''
      },
      tempSearchObj: { // 收集搜索条件输入的对象
        departmentname: ''
      },
      selectedIds: [], // 所有选择的department的id的数组
      departments: [], // 当前页的科室列表
      page: 1, // 当前页码
      limit: 5, // 每页数量
      total: 0, // 总数量
      department: {}, // 当前要操作的department
      dialogdepartmentVisible: false, // 是否显示科室添加/修改的dialog
      departmentRules: { // 科室添加/修改表单的校验规则
        departmentname: [
          { required: true, message: '科室名必须输入' },
          { min: 1, message: '科室名不能小于1位' },
        ],
      },
      loading: false, // 是否正在提交请求中
      dialogRoleVisible: false, // 是否显示角色Dialog
      isIndeterminate: false, // 是否是不确定的
      checkAll: false, // 是否全选
    }
  },

  created () {
    this.getdepartments()
  },

  methods: {
    /*
    自定义密码校验
    */
    validatePassword (rule, value, callback) {
      if (!value) {
        callback('密码必须输入')
      } else if (!value || value.length < 6) {
        callback('密码不能小于6位')
      } else {
        callback()
      }
    },
    /*
    根据输入进行搜索
    */
    search () {
      this.searchObj = {...this.tempSearchObj}
      this.getdepartments()
    },

    /*
    重置输入后搜索
    */
    resetSearch () {
      this.searchObj = {
        departmentname: ''
      }
      this.tempSearchObj = {
        departmentname: ''
      }
      this.getdepartments()
    },

    /*
    显示添加科室的界面
    */
    showAdddepartment () {
      this.department = {}
      this.dialogdepartmentVisible = true

      this.$nextTick(() => this.$refs.departmentForm.clearValidate())
    },

    /*
    删除所有选中的科室
    */
    revomvedepartments () {
      this.$confirm('确定删除吗?').then(async () => {
        await this.$API.department.removedepartments(this.selectedIds)
        this.$message.success('删除成功')
        this.getdepartments()
      }).catch(() => {
        this.$message.info('取消删除')
      })
    },

    /*
    列表选中状态发生改变的监听回调
    */
    handleSelectionChange (selection) {
      this.selectedIds = selection.map(item => item.id)
    },

    /*
    显示更新科室的界面
    */
    showUpdatedepartment (department) {
      this.department = cloneDeep(department)
      this.dialogdepartmentVisible = true
    },

    /*
    删除某个科室
    */
    async removedepartment (id) {
      await this.$API.department.removeById(id)
      this.$message.success('删除成功')
      this.getdepartments(this.departments.length===1 ? this.page-1 : this.page)
    },

    /*
    获取分页列表
    */
    async getdepartments (page=1) {
      this.page = page
      const {limit, tempSearchObj} = this
      console.log(this.$API)
      this.listLoading = true
      const result = await this.$API.department.getPageList(page, limit, tempSearchObj)
      this.listLoading = false
      const {records, total} = result.data
      this.departments = records
      this.total = total-1
      this.selectedIds = []
    },

    /*
    处理pageSize发生改变的监听回调
    */
    handleSizeChange (pageSize) {
      this.limit = pageSize
      this.getdepartments()
    },

    /*
    取消科室的保存或更新
    */
    cancel () {
      this.dialogdepartmentVisible = false
      this.department = {}
    },

    /*
    保存或者更新科室
    */
    addOrUpdate () {
      this.$refs.departmentForm.validate(valid => {
        if (valid) {
          const {department} = this
          this.loading = true
          this.$API.department[department.id ? 'update' : 'add'](department).then((result) => {
            this.loading = false
            this.$message.success('保存成功!')
            this.getdepartments(department.id ? this.page : 1)
            this.department = {}
            this.dialogdepartmentVisible = false
          })
        }
      })
    }
  }
}
</script>