<template>
    <div class="app-container">

    <el-card class="operate-container" shadow="never">
      <div style="margin-top: 15px">
        <el-form :inline="true" size="small" label-width="140px">
          <el-form-item label="输入搜索：">
            <el-input style="width: 203px" v-model="tempSearchObj.patientName" placeholder="患者名"></el-input>
          </el-form-item>

          <el-button type="primary" icon="el-icon-search" @click="getregisters()">查询</el-button>
          <el-button type="default" @click="resetSearch()">清空</el-button>
        </el-form>
      </div>
    </el-card>

    <!-- 工具条 -->
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" style="margin-top: 5px"></i>
      <span style="margin-top: 5px">数据列表</span>
      <el-button class="btn-add" size="mini" @click="showAddregister">添 加</el-button>
      <el-button class="btn-add" size="mini" @click="removeregisters" :disabled="selectedIds.length===0" style="margin: 0 10px;">批量删除</el-button>
    </el-card>

    <!-- banner列表 -->
    <el-table
      v-loading="listLoading"
      :data="registers"
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

      <el-table-column prop="patientid" label="患者序号" width="80" />
      <el-table-column prop="patientName" label="患者姓名" width="120" />
      <el-table-column prop="doctorid" label="医生序号" width="80" />
      <el-table-column prop="doctorName" label="医生名" width="120" />
      <el-table-column prop="appointmentTime" label="就诊时间" width="150" />
      <el-table-column prop="cost" label="费用" width="80" />
      <el-table-column prop="phone" label="电话" width="140" />
      <el-table-column prop="cardID" label="身份证号" width="180" />      
      <el-table-column prop="createTime" label="创建时间" width="180"/>
      <el-table-column prop="updateTime" label="更新时间" width="180"/>

      <el-table-column label="操作" width="220" align="center">
<!--        <template slot-scope="{row}">-->
<!--          <HintButton type="info" size="mini" icon="el-icon-register-solid" title="分配角色"-->
<!--            @click="showAssignRole(row)" v-if="$hasBP('btn.register.assgin')" />-->
<!--          <HintButton type="primary" size="mini" icon="el-icon-edit" title="修改患者"-->
<!--            @click="showUpdateregister(row)" v-if="$hasBP('btn.register.update')"/>-->
<!--          <el-popconfirm :title="`确定删除 ${row.registername} 吗?`" @onConfirm="removeregister(row.id)">-->
<!--            <HintButton style="margin-left:10px" slot="reference" type="danger" size="mini" icon="el-icon-delete"-->
<!--              title="删除患者" v-if="$hasBP('btn.register.remove')"/>-->
<!--          </el-popconfirm>-->
<!--        </template>-->
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="showUpdateregister(scope.row)">修改</el-button>
          <el-button type="text" size="mini" @click="removeregister(scope.row.id)">删除</el-button>
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
      @current-change="getregisters"
      @size-change="handleSizeChange"
    />

    <el-dialog :title="register.id ? '修改挂号' : '添加挂号'" :visible.sync="dialogregisterVisible">
      <el-form ref="registerForm" :model="register" :rules="registerRules" label-width="120px">
        <el-form-item label="患者序号" prop="patientId">
          <el-input v-model="register.doctorId"/>
        </el-form-item>

        <el-form-item label="医生名" prop="doctorName">
          <el-input v-model="register.doctorName"/>
        </el-form-item>

        <el-form-item label="医生序号" prop="doctorId">
          <el-input v-model="register.doctorId"/>
        </el-form-item>

        <el-form-item label="就诊时间" prop="appointmentTime">
          <el-input v-model="register.appointmentTime"/>
        </el-form-item>

        <el-form-item label="费用" prop="cost">
          <el-input v-model="register.cost"/>
        </el-form-item>

        <el-form-item label="身份证号" prop="cardID">
          <el-input v-model="register.cardID"/>
        </el-form-item>    

        <el-form-item label="电话" prop="phone">
          <el-input v-model="register.phone"/>
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
  name: 'AclregisterList',

  data () {
    return {
      listLoading: false, // 是否显示列表加载的提示
      searchObj: { // 包含请求搜索条件数据的对象
        patientName: ''
      },
      tempSearchObj: { // 收集搜索条件输入的对象
        patientName: ''
      },
      selectedIds: [], // 所有选择的register的id的数组
      registers: [], // 当前页的挂号列表
      page: 1, // 当前页码
      limit: 5, // 每页数量
      total: 0, // 总数量
      register: {}, // 当前要操作的register
      dialogregisterVisible: false, // 是否显示挂号添加/修改的dialog
      registerRules: { // 挂号添加/修改表单的校验规则
        patientname: [
          { required: true, message: '患者名必须输入' },
          { min: 1, message: '患者名不能小于1位' },
        ],
      },
      loading: false, // 是否正在提交请求中
      dialogRoleVisible: false, // 是否显示角色Dialog
      isIndeterminate: false, // 是否是不确定的
      checkAll: false, // 是否全选
    }
  },

  created () {
    this.getregisters()
  },

  methods: {
    /*
    根据输入进行搜索
    */
    search () {
      this.searchObj = {...this.tempSearchObj.patientName}
      this.getschdules()
    },

    /*
    重置输入后搜索
    */
    resetSearch () {
      this.searchObj = {
        patientName: ''
      }
      this.tempSearchObj = {
        patientName: ''
      }
      this.getregisters()
    },

    /*
    显示添加挂号的界面
    */
    showAddregister () {
      this.register = {}
      this.dialogregisterVisible = true

      this.$nextTick(() => this.$refs.registerForm.clearValidate())
    },

    /*
    删除所有选中的挂号
    */
    removeregisters () {
      this.$confirm('确定删除吗?').then(async () => {
        await this.$API.register.removeregisters(this.selectedIds)
        this.$message.success('删除成功')
        this.getregisters()
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
    显示更新挂号的界面
    */
    showUpdateregister (register) {
      this.register = cloneDeep(register)
      this.dialogregisterVisible = true
    },

    /*
    删除某个挂号
    */
    async removeregister (id) {
      await this.$API.register.removeById(id)
      this.$message.success('删除成功')
      this.getregisters(this.registers.length===1 ? this.page-1 : this.page)
    },

    /*
    获取分页列表
    */
    async getregisters (page=1) {
      this.page = page
      const {limit, tempSearchObj} = this
      console.log(this.$API)
      this.listLoading = true
      const result = await this.$API.register.getPageList(page, limit, tempSearchObj)
      this.listLoading = false
      const {records, total} = result.data
      this.registers = records
      this.total = total-1
      this.selectedIds = []
    },

    /*
    处理pageSize发生改变的监听回调
    */
    handleSizeChange (pageSize) {
      this.limit = pageSize
      this.getregisters()
    },

    /*
    取消挂号的保存或更新
    */
    cancel () {
      this.dialogregisterVisible = false
      this.register = {}
    },

    /*
    保存或者更新挂号
    */
    addOrUpdate () {

          const {register} = this
          this.loading = true
          this.$API.register[register.id ? 'update' : 'add'](register).then((result) => {
            this.loading = false
            this.$message.success('保存成功!')
            this.getregisters(register.id ? this.page : 1)
            this.register = {}
            this.dialogregisterVisible = false
          })
        }
      }
    }

</script>