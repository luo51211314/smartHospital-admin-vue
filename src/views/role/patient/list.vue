<template>
    <div class="app-container">

    <el-card class="operate-container" shadow="never">
      <div style="margin-top: 15px">
        <el-form :inline="true" size="small" label-width="140px">
          <el-form-item label="输入搜索：">
            <el-input style="width: 203px" v-model="tempSearchObj.patientname" placeholder="患者名"></el-input>
          </el-form-item>

          <el-button type="primary" icon="el-icon-search" @click="getpatients()">查询</el-button>
          <el-button type="default" @click="resetSearch()">清空</el-button>
        </el-form>
      </div>
    </el-card>

    <!-- 工具条 -->
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" style="margin-top: 5px"></i>
      <span style="margin-top: 5px">数据列表</span>
      <el-button class="btn-add" size="mini" @click="showAddpatient">添 加</el-button>
      <el-button class="btn-add" size="mini" @click="revomvepatients" :disabled="selectedIds.length===0" style="margin: 0 10px;">批量删除</el-button>
    </el-card>

    <!-- banner列表 -->
    <el-table
      v-loading="listLoading"
      :data="patients"
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

      <el-table-column prop="patientname" label="患者名" width="120" />
      <el-table-column prop="age" label="年龄" width="50" />
      <el-table-column prop="phone" label="电话" width="140" />
      <el-table-column prop="cardID" label="身份证号" width="180" />
      <el-table-column prop="createTime" label="创建时间" width="180"/>
      <el-table-column prop="updateTime" label="更新时间" width="180"/>

      <el-table-column label="操作" width="220" align="center">
<!--        <template slot-scope="{row}">-->
<!--          <HintButton type="info" size="mini" icon="el-icon-patient-solid" title="分配角色"-->
<!--            @click="showAssignRole(row)" v-if="$hasBP('btn.patient.assgin')" />-->
<!--          <HintButton type="primary" size="mini" icon="el-icon-edit" title="修改患者"-->
<!--            @click="showUpdatepatient(row)" v-if="$hasBP('btn.patient.update')"/>-->
<!--          <el-popconfirm :title="`确定删除 ${row.patientname} 吗?`" @onConfirm="removepatient(row.id)">-->
<!--            <HintButton style="margin-left:10px" slot="reference" type="danger" size="mini" icon="el-icon-delete"-->
<!--              title="删除患者" v-if="$hasBP('btn.patient.remove')"/>-->
<!--          </el-popconfirm>-->
<!--        </template>-->
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="showUpdatepatient(scope.row)">修改</el-button>
          <el-button type="text" size="mini" @click="removepatient(scope.row.id)">删除</el-button>
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
      @current-change="getpatients"
      @size-change="handleSizeChange"
    />

    <el-dialog :title="patient.id ? '修改患者' : '添加患者'" :visible.sync="dialogpatientVisible">
      <el-form ref="patientForm" :model="patient" :rules="patientRules" label-width="120px">
        <el-form-item label="患者名" prop="patientname">
          <el-input v-model="patient.patientname"/>
        </el-form-item>

        <el-form-item label="患者电话">
          <el-input v-model="patient.phone"/>
        </el-form-item>

        <el-form-item label="身份证号">
          <el-input v-model="patient.cardID"/>
        </el-form-item>

        <el-form-item v-if="!patient.id" label="患者密码" prop="password">
          <el-input v-model="patient.password"/>
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
  name: 'AclpatientList',

  data () {
    return {
      listLoading: false, // 是否显示列表加载的提示
      searchObj: { // 包含请求搜索条件数据的对象
        patientname: ''
      },
      tempSearchObj: { // 收集搜索条件输入的对象
        patientname: ''
      },
      selectedIds: [], // 所有选择的patient的id的数组
      patients: [], // 当前页的患者列表
      page: 1, // 当前页码
      limit: 5, // 每页数量
      total: 0, // 总数量
      patient: {}, // 当前要操作的patient
      dialogpatientVisible: false, // 是否显示患者添加/修改的dialog
      patientRules: { // 患者添加/修改表单的校验规则
        patientname: [
          { required: true, message: '患者名必须输入' },
          { min: 1, message: '患者名不能小于1位' },
        ],
        password: [
          { required: true, validator: this.validatePassword }
        ],
        cardID: [
          { required: true, length: 18, message: '患者身份证必须是18位'}
        ]
      },
      loading: false, // 是否正在提交请求中
      dialogRoleVisible: false, // 是否显示角色Dialog
      isIndeterminate: false, // 是否是不确定的
      checkAll: false, // 是否全选
    }
  },

  created () {
    this.getpatients()
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
      this.getpatients()
    },

    /*
    重置输入后搜索
    */
    resetSearch () {
      this.searchObj = {
        patientname: ''
      }
      this.tempSearchObj = {
        patientname: ''
      }
      this.getpatients()
    },

    /*
    显示添加患者的界面
    */
    showAddpatient () {
      this.patient = {}
      this.dialogpatientVisible = true

      this.$nextTick(() => this.$refs.patientForm.clearValidate())
    },

    /*
    删除所有选中的患者
    */
    revomvepatients () {
      this.$confirm('确定删除吗?').then(async () => {
        await this.$API.patient.removepatients(this.selectedIds)
        this.$message.success('删除成功')
        this.getpatients()
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
    显示更新患者的界面
    */
    showUpdatepatient (patient) {
      this.patient = cloneDeep(patient)
      this.dialogpatientVisible = true
    },

    /*
    删除某个患者
    */
    async removepatient (id) {
      await this.$API.patient.removeById(id)
      this.$message.success('删除成功')
      this.getpatients(this.patients.length===1 ? this.page-1 : this.page)
    },

    /*
    获取分页列表
    */
    async getpatients (page=1) {
      this.page = page
      const {limit, tempSearchObj} = this
      console.log(this.$API)
      this.listLoading = true
      const result = await this.$API.patient.getPageList(page, limit, tempSearchObj)
      this.listLoading = false
      const {records, total} = result.data
      this.patients = records
      this.total = total-1
      this.selectedIds = []
    },

    /*
    处理pageSize发生改变的监听回调
    */
    handleSizeChange (pageSize) {
      this.limit = pageSize
      this.getpatients()
    },

    /*
    取消患者的保存或更新
    */
    cancel () {
      this.dialogpatientVisible = false
      this.patient = {}
    },

    /*
    保存或者更新患者
    */
    addOrUpdate () {
      this.$refs.patientForm.validate(valid => {
        if (valid) {
          const {patient} = this
          this.loading = true
          this.$API.patient[patient.id ? 'update' : 'add'](patient).then((result) => {
            this.loading = false
            this.$message.success('保存成功!')
            this.getpatients(patient.id ? this.page : 1)
            this.patient = {}
            this.dialogpatientVisible = false
          })
        }
      })
    }
  }
}
</script>