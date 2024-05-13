<template>
    <div class="app-container">

    <el-card class="operate-container" shadow="never">
      <div style="margin-top: 15px">
        <el-form :inline="true" size="small" label-width="140px">
          <el-form-item label="输入搜索：">
            <el-input style="width: 203px" v-model="tempSearchObj.doctorName" placeholder="医生名"></el-input>
          </el-form-item>

          <el-button type="primary" icon="el-icon-search" @click="getschedules()">查询</el-button>
          <el-button type="default" @click="resetSearch()">清空</el-button>
        </el-form>
      </div>
    </el-card>

    <!-- 工具条 -->
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" style="margin-top: 5px"></i>
      <span style="margin-top: 5px">数据列表</span>
      <el-button class="btn-add" size="mini" @click="showAddschedule">添 加</el-button>
      <el-button class="btn-add" size="mini" @click="removeschedules" :disabled="selectedIds.length===0" style="margin: 0 10px;">批量删除</el-button>
    </el-card>

    <!-- banner列表 -->
    <el-table
      v-loading="listLoading"
      :data="schedules"
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

      <el-table-column prop="doctorid" label="医生序号" width="80" />
      <el-table-column prop="doctorName" label="医生名" width="120" />
      <el-table-column prop="timeStart" label="就诊时间" width="150" />
      <el-table-column prop="timeEnd" label="结束时间" width="150" />
      <el-table-column prop="departmentid" label="就诊科室" width="80" />
      <el-table-column prop="availableSlots" label="可预约号源" width="120" />
      <el-table-column prop="bookedSlots" label="已预约号源" width="120" />
      <el-table-column prop="createTime" label="创建时间" width="180"/>
      <el-table-column prop="updateTime" label="更新时间" width="180"/>

      <el-table-column label="操作" width="220" align="center">
<!--        <template slot-scope="{row}">-->
<!--          <HintButton type="info" size="mini" icon="el-icon-schedule-solid" title="分配角色"-->
<!--            @click="showAssignRole(row)" v-if="$hasBP('btn.schedule.assgin')" />-->
<!--          <HintButton type="primary" size="mini" icon="el-icon-edit" title="修改患者"-->
<!--            @click="showUpdateschedule(row)" v-if="$hasBP('btn.schedule.update')"/>-->
<!--          <el-popconfirm :title="`确定删除 ${row.schedulename} 吗?`" @onConfirm="removeschedule(row.id)">-->
<!--            <HintButton style="margin-left:10px" slot="reference" type="danger" size="mini" icon="el-icon-delete"-->
<!--              title="删除患者" v-if="$hasBP('btn.schedule.remove')"/>-->
<!--          </el-popconfirm>-->
<!--        </template>-->
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="showUpdateschedule(scope.row)">修改</el-button>
          <el-button type="text" size="mini" @click="removeschedule(scope.row.id)">删除</el-button>
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
      @current-change="getschedules"
      @size-change="handleSizeChange"
    />

    <el-dialog :title="schedule.id ? '修改排班' : '添加排班'" :visible.sync="dialogscheduleVisible">
      <el-form ref="scheduleForm" :model="schedule" :rules="scheduleRules" label-width="120px">
        <el-form-item label="医生序号" prop="doctorid">
          <el-input v-model="schedule.doctorid"/>
        </el-form-item>

        <el-form-item label="医生名" prop="doctorName">
          <el-input v-model="schedule.doctorName"/>
        </el-form-item>

        <el-form-item label="就诊时间">
          <el-input v-model="schedule.timeStart"/>
        </el-form-item>

        <el-form-item label="结束时间">
          <el-input v-model="schedule.timeEnd"/>
        </el-form-item>

        <el-form-item label="就诊科室">
          <el-input v-model="schedule.departmentid"/>
        </el-form-item>

        <el-form-item label="可预约号源">
          <el-input v-model="schedule.availableSlots"/>
        </el-form-item>

        <el-form-item label="已预约号源">
          <el-input v-model="schedule.bookedSlots"/>
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
  name: 'AclscheduleList',

  data () {
    return {
      listLoading: false, // 是否显示列表加载的提示
      searchObj: { // 包含请求搜索条件数据的对象
        doctorName: ''
      },
      tempSearchObj: { // 收集搜索条件输入的对象
        doctorName: ''
      },
      selectedIds: [], // 所有选择的schedule的id的数组
      schedules: [], // 当前页的排班列表
      page: 1, // 当前页码
      limit: 5, // 每页数量
      total: 0, // 总数量
      schedule: {}, // 当前要操作的schedule
      dialogscheduleVisible: false, // 是否显示排班添加/修改的dialog
      scheduleRules: { // 排班添加/修改表单的校验规则
        doctorname: [
          { required: true, message: '医生名必须输入' },
          { min: 1, message: '医生名不能小于1位' },
        ],
      },
      loading: false, // 是否正在提交请求中
      dialogRoleVisible: false, // 是否显示角色Dialog
      isIndeterminate: false, // 是否是不确定的
      checkAll: false, // 是否全选
    }
  },

  created () {
    this.getschedules()
  },

  methods: {
    /*
    根据输入进行搜索
    */
    search () {
      this.searchObj = {...this.tempSearchObj.doctorName}
      this.getschdules()
    },

    /*
    重置输入后搜索
    */
    resetSearch () {
      this.searchObj = {
        doctorName: ''
      }
      this.tempSearchObj = {
        doctorName: ''
      }
      this.getschedules()
    },

    /*
    显示添加排班的界面
    */
    showAddschedule () {
      this.schedule = {}
      this.dialogscheduleVisible = true

      this.$nextTick(() => this.$refs.scheduleForm.clearValidate())
    },

    /*
    删除所有选中的患者
    */
    removeschedules () {
      this.$confirm('确定删除吗?').then(async () => {
        await this.$API.schedule.removeschedules(this.selectedIds)
        this.$message.success('删除成功')
        this.getschedules()
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
    显示更新排班的界面
    */
    showUpdateschedule (schedule) {
      this.schedule = cloneDeep(schedule)
      this.dialogscheduleVisible = true
    },

    /*
    删除某个排班
    */
    async removeschedule (id) {
      await this.$API.schedule.removeById(id)
      this.$message.success('删除成功')
      this.getschedules(this.schedules.length===1 ? this.page-1 : this.page)
    },

    /*
    获取分页列表
    */
    async getschedules (page=1) {
      this.page = page
      const {limit, tempSearchObj} = this
      console.log(this.$API)
      this.listLoading = true
      const result = await this.$API.schedule.getPageList(page, limit, tempSearchObj)
      this.listLoading = false
      const {records, total} = result.data
      this.schedules = records
      this.total = total-1
      this.selectedIds = []
    },

    /*
    处理pageSize发生改变的监听回调
    */
    handleSizeChange (pageSize) {
      this.limit = pageSize
      this.getschedules()
    },

    /*
    取消排班的保存或更新
    */
    cancel () {
      this.dialogscheduleVisible = false
      this.schedule = {}
    },

    /*
    保存或者更新排班
    */
    addOrUpdate () {

          const {schedule} = this
          this.loading = true
          this.$API.schedule[schedule.id ? 'update' : 'add'](schedule).then((result) => {
            this.loading = false
            this.$message.success('保存成功!')
            this.getschedules(schedule.id ? this.page : 1)
            this.schedule = {}
            this.dialogscheduleVisible = false
          })
        }
      }
    }

</script>