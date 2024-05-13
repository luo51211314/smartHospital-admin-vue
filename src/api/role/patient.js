import request from '@/utils/request'

const api_name = '/admin/role/patient'


/*
获取后台患者分页列表(带搜索)
*/
export function getPageList(page, limit, searchObj) {
  return request({
    url: `${api_name}/${page}/${limit}`,
    method: 'get',
    params: searchObj
  })
}

/*
根据ID获取某个后台患者
*/
export function getById(id) {
  return request({
    url: `${api_name}/get/${id}`,
    method: 'get'
  })
}

/*
保存一个新的后台患者
*/
export function add(patient) {
  return request({
    url: `${api_name}/save`,
    method: 'post',
    data: patient
  })
}

/*
更新一个后台患者
*/
export function update(patient) {
  return request({
    url: `${api_name}/update`,
    method: 'put',
    data: patient
  })
}


/*
删除某个患者
*/
export function removeById(id) {
  return request({
    url: `${api_name}/remove/${id}`,
    method: 'delete'
  })
}

/*
批量删除多个患者
ids的结构: ids是包含n个id的数组
*/
export function removepatients(ids) {
  return request({
    url: `${api_name}/batchRemove`,
    method: 'delete',
    data: ids
  })
}
