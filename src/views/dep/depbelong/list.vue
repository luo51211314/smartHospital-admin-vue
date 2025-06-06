<template>
    <div class="app-container">

    <el-card class="operate-container" shadow="never">
      <div style="margin-top: 15px">
        <el-form :inline="true" size="small" label-width="140px">
          <el-form-item label="输入搜索：">
            <el-input style="width: 203px" v-model="tempSearchObj.departmentname" placeholder="科室名"></el-input>
          </el-form-item>

          <el-button type="primary" icon="el-icon-search" @click="getdepbelongs()">查询</el-button>
          <el-button type="default" @click="resetSearch()">清空</el-button>
        </el-form>
      </div>
    </el-card>

    <!-- 工具条 -->
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" style="margin-top: 5px"></i>
      <span style="margin-top: 5px">数据列表</span>
      <el-button class="btn-add" size="mini" @click="showAdddepbelong">添 加</el-button>
      <el-button class="btn-add" size="mini" @click="revomvedepbelongs" :disabled="selectedIds.length===0" style="margin: 0 10px;">批量删除</el-button>
    </el-card>

    <!-- banner列表 -->
    <el-table
      v-loading="listLoading"
      :data="depbelongs"
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

      <el-table-column prop="departmentId" label="科室序号" width="80" />
      <el-table-column prop="departmentname" label="科室名" width="120" />
      <el-table-column prop="doctorId" label="医生序号" width="80" />
      <el-table-column prop="doctorname" label="医生名" width="120" />  
      <el-table-column prop="title" label="职称" width="120" /> 
      <el-table-column prop="skill" label="擅长" width="140" />    
      <el-table-column prop="createTime" label="创建时间" width="180"/>
      <el-table-column prop="updateTime" label="更新时间" width="180"/>

      <el-table-column label="操作" width="220" align="center">
<!--        <template slot-scope="{row}">-->
<!--          <HintButton type="info" size="mini" icon="el-icon-depbelong-solid" title="分配角色"-->
<!--            @click="showAssignRole(row)" v-if="$hasBP('btn.depbelong.assgin')" />-->
<!--          <HintButton type="primary" size="mini" icon="el-icon-edit" title="修改科室"-->
<!--            @click="showUpdatedepbelong(row)" v-if="$hasBP('btn.depbelong.update')"/>-->
<!--          <el-popconfirm :title="`确定删除 ${row.depbelongname} 吗?`" @onConfirm="removedepbelong(row.id)">-->
<!--            <HintButton style="margin-left:10px" slot="reference" type="danger" size="mini" icon="el-icon-delete"-->
<!--              title="删除科室" v-if="$hasBP('btn.depbelong.remove')"/>-->
<!--          </el-popconfirm>-->
<!--        </template>-->
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="showUpdatedepbelong(scope.row)">修改</el-button>
          <el-button type="text" size="mini" @click="removedepbelong(scope.row.id)">删除</el-button>
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
      @current-change="getdepbelongs"
      @size-change="handleSizeChange"
    />

    <el-dialog :title="depbelong.id ? '修改科室医生' : '添加科室医生'" :visible.sync="dialogdepbelongVisible">
      <el-form ref="depbelongForm" :model="depbelong" :rules="depbelongRules" label-width="120px">
        <el-form-item label="科室序号" prop="departmentId">
          <el-input v-model="depbelong.departmentId"/>
        </el-form-item>

        <el-form-item label="科室名" prop="departmentname">
          <el-input v-model="depbelong.departmentname"/>
        </el-form-item>        

        <el-form-item label="医生序号" prop="doctorId">
          <el-input v-model="depbelong.doctorId"/>
        </el-form-item>

        <el-form-item label="医生名" prop="doctorname">
          <el-input v-model="depbelong.doctorname"/>
        </el-form-item>

        <el-form-item label="职称" prop="title">
          <el-input v-model="depbelong.title"/>
        </el-form-item>

        <el-form-item label="擅长" prop="skill">
          <el-input v-model="depbelong.skill"/>
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
  name: 'AcldepbelongList',

  data () {
    return {
      listLoading: false, // 是否显示列表加载的提示
      searchObj: { // 包含请求搜索条件数据的对象
        departmentname: ''
      },
      tempSearchObj: { // 收集搜索条件输入的对象
        departmentname: ''
      },
      selectedIds: [], // 所有选择的depbelong的id的数组
      depbelongs: [], // 当前页的科室列表
      page: 1, // 当前页码
      limit: 5, // 每页数量
      total: 0, // 总数量
      depbelong: {}, // 当前要操作的depbelong
      dialogdepbelongVisible: false, // 是否显示科室添加/修改的dialog
      depbelongRules: { // 科室添加/修改表单的校验规则
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
    this.getdepbelongs()
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
      this.getdepbelongs()
    },

    /*
    重置输入后搜索
    */
    resetSearch () {
      this.searchObj = {
        depbelongname: ''
      }
      this.tempSearchObj = {
        depbelongname: ''
      }
      this.getdepbelongs()
    },

    /*
    显示添加科室医生的界面
    */
    showAdddepbelong () {
      this.depbelong = {}
      this.dialogdepbelongVisible = true

      this.$nextTick(() => this.$refs.depbelongForm.clearValidate())
    },

    /*
    删除所有选中的科室医生
    */
    revomvedepbelongs () {
      this.$confirm('确定删除吗?').then(async () => {
        await this.$API.depbelong.removedepbelongs(this.selectedIds)
        this.$message.success('删除成功')
        this.getdepbelongs()
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
    显示更新科室医生的界面
    */
    showUpdatedepbelong (depbelong) {
      this.depbelong = cloneDeep(depbelong)
      this.dialogdepbelongVisible = true
    },

    /*
    删除某个科室医生
    */
    async removedepbelong (id) {
      await this.$API.depbelong.removeById(id)
      this.$message.success('删除成功')
      this.getdepbelongs(this.depbelongs.length===1 ? this.page-1 : this.page)
    },

    /*
    获取分页列表
    */
    async getdepbelongs (page=1) {
      this.page = page
      const {limit, tempSearchObj} = this
      console.log(this.$API)
      this.listLoading = true
      const result = await this.$API.depbelong.getPageList(page, limit, tempSearchObj)
      this.listLoading = false
      const {records, total} = result.data
      this.depbelongs = records
      this.total = total-1
      this.selectedIds = []
    },

    /*
    处理pageSize发生改变的监听回调
    */
    handleSizeChange (pageSize) {
      this.limit = pageSize
      this.getdepbelongs()
    },

    /*
    取消科室的保存或更新
    */
    cancel () {
      this.dialogdepbelongVisible = false
      this.depbelong = {}
    },

    /*
    保存或者更新科室医生
    */
    addOrUpdate () {
      this.$refs.depbelongForm.validate(valid => {
        if (valid) {
          const {depbelong} = this
          this.loading = true
          this.$API.depbelong[depbelong.id ? 'update' : 'add'](depbelong).then((result) => {
            this.loading = false
            this.$message.success('保存成功!')
            this.getdepbelongs(depbelong.id ? this.page : 1)
            this.depbelong = {}
            this.dialogdepbelongVisible = false
          })
        }
      })
    }
  }
}
</script>