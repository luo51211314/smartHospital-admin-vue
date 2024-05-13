<template>
    <div class="app-container">

    <el-card class="operate-container" shadow="never">
      <div style="margin-top: 15px">
        <el-form :inline="true" size="small" label-width="140px">
          <el-form-item label="输入搜索：">
            <el-input style="width: 203px" v-model="tempSearchObj.doctorname" placeholder="医生名"></el-input>
          </el-form-item>

          <el-button type="primary" icon="el-icon-search" @click="getdoctors()">查询</el-button>
          <el-button type="default" @click="resetSearch()">清空</el-button>
        </el-form>
      </div>
    </el-card>

    <!-- 工具条 -->
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" style="margin-top: 5px"></i>
      <span style="margin-top: 5px">数据列表</span>
      <el-button class="btn-add" size="mini" @click="showAdddoctor">添 加</el-button>
      <el-button class="btn-add" size="mini" @click="revomvedoctors" :disabled="selectedIds.length===0" style="margin: 0 10px;">批量删除</el-button>
    </el-card>

    <!-- banner列表 -->
    <el-table
      v-loading="listLoading"
      :data="doctors"
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

      <el-table-column prop="doctorname" label="医生名" width="120" />
      <el-table-column prop="phone" label="电话" width="140" />
      <el-table-column prop="createTime" label="创建时间" width="180"/>
      <el-table-column prop="updateTime" label="更新时间" width="180"/>

      <el-table-column label="操作" width="220" align="center">
<!--        <template slot-scope="{row}">-->
<!--          <HintButton type="info" size="mini" icon="el-icon-doctor-solid" title="分配角色"-->
<!--            @click="showAssignRole(row)" v-if="$hasBP('btn.doctor.assgin')" />-->
<!--          <HintButton type="primary" size="mini" icon="el-icon-edit" title="修改医生"-->
<!--            @click="showUpdatedoctor(row)" v-if="$hasBP('btn.doctor.update')"/>-->
<!--          <el-popconfirm :title="`确定删除 ${row.doctorname} 吗?`" @onConfirm="removedoctor(row.id)">-->
<!--            <HintButton style="margin-left:10px" slot="reference" type="danger" size="mini" icon="el-icon-delete"-->
<!--              title="删除医生" v-if="$hasBP('btn.doctor.remove')"/>-->
<!--          </el-popconfirm>-->
<!--        </template>-->
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="showUpdatedoctor(scope.row)">修改</el-button>
          <el-button type="text" size="mini" @click="removedoctor(scope.row.id)">删除</el-button>
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
      @current-change="getdoctors"
      @size-change="handleSizeChange"
    />

    <el-dialog :title="doctor.id ? '修改医生' : '添加医生'" :visible.sync="dialogdoctorVisible">
      <el-form ref="doctorForm" :model="doctor" :rules="doctorRules" label-width="120px">
        <el-form-item label="医生名" prop="doctorname">
          <el-input v-model="doctor.doctorname"/>
        </el-form-item>
        <el-form-item label="医生电话">
          <el-input v-model="doctor.phone"/>
        </el-form-item>

        <el-form-item v-if="!doctor.id" label="医生密码" prop="password">
          <el-input v-model="doctor.password"/>
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
  name: 'AcldoctorList',

  data () {
    return {
      listLoading: false, // 是否显示列表加载的提示
      searchObj: { // 包含请求搜索条件数据的对象
        doctorname: ''
      },
      tempSearchObj: { // 收集搜索条件输入的对象
        doctorname: ''
      },
      selectedIds: [], // 所有选择的doctor的id的数组
      doctors: [], // 当前页的医生列表
      page: 1, // 当前页码
      limit: 5, // 每页数量
      total: 0, // 总数量
      doctor: {}, // 当前要操作的doctor
      dialogdoctorVisible: false, // 是否显示医生添加/修改的dialog
      doctorRules: { // 医生添加/修改表单的校验规则
        doctorname: [
          { required: true, message: '医生名必须输入' },
          { min: 1, message: '医生名不能小于1位' }
        ],
        password: [
          { required: true, validator: this.validatePassword }
        ]
      },
      loading: false, // 是否正在提交请求中
      dialogRoleVisible: false, // 是否显示角色Dialog
      isIndeterminate: false, // 是否是不确定的
      checkAll: false, // 是否全选
    }
  },

  created () {
    this.getdoctors()
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
      this.getdoctors()
    },

    /*
    重置输入后搜索
    */
    resetSearch () {
      this.searchObj = {
        doctorname: ''
      }
      this.tempSearchObj = {
        doctorname: ''
      }
      this.getdoctors()
    },

    /*
    显示添加医生的界面
    */
    showAdddoctor () {
      this.doctor = {}
      this.dialogdoctorVisible = true

      this.$nextTick(() => this.$refs.doctorForm.clearValidate())
    },

    /*
    删除所有选中的医生
    */
    revomvedoctors () {
      this.$confirm('确定删除吗?').then(async () => {
        await this.$API.doctor.removedoctors(this.selectedIds)
        this.$message.success('删除成功')
        this.getdoctors()
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
    显示更新医生的界面
    */
    showUpdatedoctor (doctor) {
      this.doctor = cloneDeep(doctor)
      this.dialogdoctorVisible = true
    },

    /*
    删除某个医生
    */
    async removedoctor (id) {
      await this.$API.doctor.removeById(id)
      this.$message.success('删除成功')
      this.getdoctors(this.doctors.length===1 ? this.page-1 : this.page)
    },

    /*
    获取分页列表
    */
    async getdoctors (page=1) {
      this.page = page
      const {limit, tempSearchObj} = this
      console.log(this.$API)
      this.listLoading = true
      const result = await this.$API.doctor.getPageList(page, limit, tempSearchObj)
      this.listLoading = false
      const {records, total} = result.data
      this.doctors = records
      this.total = total-1
      this.selectedIds = []
    },

    /*
    处理pageSize发生改变的监听回调
    */
    handleSizeChange (pageSize) {
      this.limit = pageSize
      this.getdoctors()
    },

    /*
    取消医生的保存或更新
    */
    cancel () {
      this.dialogdoctorVisible = false
      this.doctor = {}
    },

    /*
    保存或者更新医生
    */
    addOrUpdate () {
      this.$refs.doctorForm.validate(valid => {
        if (valid) {
          const {doctor} = this
          this.loading = true
          this.$API.doctor[doctor.id ? 'update' : 'add'](doctor).then((result) => {
            this.loading = false
            this.$message.success('保存成功!')
            this.getdoctors(doctor.id ? this.page : 1)
            this.doctor = {}
            this.dialogdoctorVisible = false
          })
        }
      })
    }
  }
}
</script>
